import { test } from "node:test";
import assert from "node:assert/strict";
import * as pkg from "./index.js";

// BROKERAGE-IDENTITY U1 (Platform KA prompt 2140; design
// BUILD-|-WORKSTREAM/BROKERAGE-IDENTITY/DESIGN-BROKERAGE-IDENTITY-261127.md §2, §4.1).
// v0.11.0 adds the brokerage's legal identity to each licence facet
// (`agent.licenses.mlo` / `agent.licenses.re`): firmLegalName, firmTradeNames,
// firmStateLicenses, firmHqAddress, firmStateDisclosureTokens and stateNumbers.
// Every one is optional AND nullable: absent = no change, null = cleared in
// Rello, a value = set (the v0.9.0 D-349 rule).
//
// The facets sit TWO levels below the root (agent → licenses → mlo), and before
// v0.11.0 the projection recursed exactly one level (into `agent`), so a facet
// rode to a spoke whole. A spoke pinned below v0.11.0 has `.strict()` facets:
// handed a new facet key, its receiver 400s and the whole push fails. These
// tests pin that the projection strips the new facet keys for every older pin,
// and that a v0.10.0 spoke receives byte-for-byte what it received before.

const { VERSIONED_SCHEMAS, projectPayloadForVersion, PACKAGE_SCHEMA_VERSION, AgentProvisioningPayloadSchema } = pkg;
type Version = keyof typeof VERSIONED_SCHEMAS;
const schemas = VERSIONED_SCHEMAS as Record<string, { safeParse: (v: unknown) => { success: boolean; error?: unknown } } | undefined>;
const S = (v: string) => {
  const s = schemas[v];
  if (!s) throw new Error(`schema ${v} is not registered`);
  return s;
};

const NEW_FACET_KEYS = [
  "firmLegalName",
  "firmTradeNames",
  "firmStateLicenses",
  "firmHqAddress",
  "firmStateDisclosureTokens",
  "stateNumbers",
] as const;

// What a v0.10.0 producer sent (Rello push-agent.ts today).
const mloBefore = {
  nmlsNumber: "100001",
  states: ["UT", "ID"],
  firmName: "Example Trade Name",
  firmLicense: "200002",
  firmLogoUrl: "https://example.test/logo.png",
};
const reBefore = {
  licenseNumber: "RE-300003",
  states: ["UT"],
  firmName: "Example Realty",
  firmLicense: "B-400004",
};
const mloNew = {
  firmLegalName: "Example Lending Group, Inc.",
  firmTradeNames: ["Example Trade Name"],
  firmStateLicenses: { ID: "MBL-500005" },
  firmHqAddress: "1 Example Way, Example City, UT 84000",
  firmStateDisclosureTokens: { TX: { recoveryFundUrl: "https://example.test/tx" } },
  stateNumbers: { ID: "MLO-600006" },
};
const reNew = {
  firmLegalName: "Example Realty LLC",
  firmTradeNames: null,
  firmStateLicenses: null,
  firmHqAddress: null,
  firmStateDisclosureTokens: null,
  stateNumbers: { UT: "RE-300003" },
};

const payload = (withNew: boolean) => ({
  tenantId: "t_1",
  syncedAt: "2026-11-27T00:00:00.000Z",
  action: "update",
  physicalAddress: null,
  tenantBranding: { terminology: {}, teamRoleCopy: {} },
  agent: {
    relloAgentId: "agent_1",
    relloUserId: "user_1",
    email: "dual@example.test",
    firstName: "Dee",
    lastName: "Dual",
    slug: "dee-dual",
    role: "MLO",
    phone: null,
    emailSignature: null,
    loginless: false,
    roles: ["MLO", "RE"],
    licenses: {
      mlo: { ...mloBefore, ...(withNew ? mloNew : {}) },
      re: { ...reBefore, ...(withNew ? reNew : {}) },
    },
  },
});

test("v0.11.0 is registered; v0.12.0 (tenant logo + colours) and v0.13.0 (sponsorLenderAgentId) build on it", () => {
  // v0.12.0 and v0.13.0 moved PACKAGE_SCHEMA_VERSION and the latest alias on; v0.11.0 stays registered.
  assert.equal(PACKAGE_SCHEMA_VERSION, "v0.13.0");
  assert.equal("v0.11.0" in VERSIONED_SCHEMAS, true);
  assert.notEqual(VERSIONED_SCHEMAS["v0.11.0" as Version], AgentProvisioningPayloadSchema);
});

test("a v0.11.0 payload with every new facet field set, null, or absent parses", () => {
  assert.equal(S("v0.11.0").safeParse(payload(true)).success, true, "set + null");
  assert.equal(S("v0.11.0").safeParse(payload(false)).success, true, "absent: a v0.10.0 producer's payload still parses");
});

test("v0.11.0 refuses a malformed new field (state keys are two capital letters; values are strings)", () => {
  const bad = (mlo: Record<string, unknown>) => {
    const p = payload(true);
    return { ...p, agent: { ...p.agent, licenses: { mlo: { ...p.agent.licenses.mlo, ...mlo } } } };
  };
  assert.equal(S("v0.11.0").safeParse(bad({ firmStateLicenses: { idaho: "MBL-1" } })).success, false, "state key not a code");
  assert.equal(S("v0.11.0").safeParse(bad({ stateNumbers: { ID: 5 } })).success, false, "number, not string");
  assert.equal(S("v0.11.0").safeParse(bad({ firmTradeNames: "one name" })).success, false, "string, not list");
  assert.equal(S("v0.11.0").safeParse(bad({ firmStateDisclosureTokens: { TX: "url" } })).success, false, "tokens are a map per state");
  assert.equal(S("v0.11.0").safeParse(bad({ firmLegalNam: "typo" })).success, false, "facets stay strict");
});

test("every schema from v0.7.0 to v0.10.0 refuses the new facet keys (strict), so the projection must strip them", () => {
  for (const v of ["v0.7.0", "v0.7.1", "v0.8.0", "v0.9.0", "v0.10.0"]) {
    for (const key of NEW_FACET_KEYS) {
      const p = payload(false);
      const withOne = { ...p, agent: { ...p.agent, licenses: { mlo: { ...mloBefore, [key]: mloNew[key] } } } };
      // Older agent shapes may not declare every root agent key in p (e.g. loginless), so project first, then add the one key back.
      const projected = projectPayloadForVersion(withOne, v as Version).projected as { agent: { licenses?: { mlo?: object } } };
      const reAdded = { ...projected, agent: { ...projected.agent, licenses: { mlo: { ...(projected.agent.licenses?.mlo ?? {}), [key]: mloNew[key] } } } };
      assert.equal(S(v).safeParse(reAdded).success, false, `${v} must not declare licenses.mlo.${key}`);
    }
  }
});

test("projection to v0.10.0 is byte-equal to what a v0.10.0 spoke received before v0.11.0", () => {
  const before = projectPayloadForVersion(payload(false), "v0.10.0");
  const after = projectPayloadForVersion(payload(true), "v0.10.0");
  assert.equal(JSON.stringify(after.projected), JSON.stringify(before.projected));
  assert.equal(JSON.stringify(after.projected), JSON.stringify(payload(false)));
  assert.equal(S("v0.10.0").safeParse(after.projected).success, true, "a strict v0.10.0 receiver accepts it");
  assert.deepEqual(after.droppedNulls, before.droppedNulls);
  for (const facet of ["mlo", "re"]) {
    for (const key of NEW_FACET_KEYS) {
      assert.ok(after.omittedFields.includes(`agent.licenses.${facet}.${key}`), `omittedFields reports agent.licenses.${facet}.${key}: ${after.omittedFields.join(",")}`);
    }
  }
});

test("projection to every pin from v0.7.0 to v0.10.0 parses under that pin's strict schema", () => {
  for (const v of ["v0.7.0", "v0.7.1", "v0.8.0", "v0.9.0", "v0.10.0"]) {
    const out = projectPayloadForVersion(payload(true), v as Version);
    const parsed = S(v).safeParse(out.projected);
    assert.equal(parsed.success, true, `${v}: ${JSON.stringify(parsed.error ?? "")}`);
    const expected = projectPayloadForVersion(payload(false), v as Version).projected;
    assert.equal(JSON.stringify(out.projected), JSON.stringify(expected), `${v} receives exactly its pre-v0.11.0 payload`);
  }
});

test("projection below v0.7.0 still strips licenses whole, as before", () => {
  const out = projectPayloadForVersion(payload(true), "v0.6.0");
  assert.equal("licenses" in (out.projected as { agent: object }).agent, false);
  assert.ok(out.omittedFields.includes("agent.licenses"));
});

test("projection to v0.11.0 keeps every new field, nulls included", () => {
  const out = projectPayloadForVersion(payload(true), "v0.11.0");
  const lic = (out.projected as { agent: { licenses: { mlo: Record<string, unknown>; re: Record<string, unknown> } } }).agent.licenses;
  for (const key of NEW_FACET_KEYS) {
    assert.deepEqual(lic.mlo[key], mloNew[key]);
    assert.ok(key in lic.re, `re.${key} kept (null means cleared)`);
    assert.deepEqual(lic.re[key], reNew[key]);
  }
  assert.deepEqual(out.omittedFields, []);
  assert.deepEqual(out.droppedNulls, []);
  assert.equal(S("v0.11.0").safeParse(out.projected).success, true);
});
