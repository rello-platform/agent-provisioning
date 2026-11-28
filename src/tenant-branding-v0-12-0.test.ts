import { test } from "node:test";
import assert from "node:assert/strict";
import * as pkg from "./index.js";

// SETTINGS-CASCADE C4 (Platform KA prompt 2242; ruling on a5-2236 BLOCKER 1).
// v0.12.0 adds the tenant's logo and colours to the agent push's branding block:
// tenantBranding.logoUrl, tenantBranding.primaryColor, tenantBranding.accentColor.
// Each is optional AND nullable: absent = no change, null = cleared in Rello, a
// value = set (the v0.9.0 D-349 rule).
//
// Before v0.12.0 the projection did not recurse into `tenantBranding`: the block
// rode to a spoke whole. Every older pin's branding shape is `.strict()` with only
// terminology + teamRoleCopy, so a new key would 400 its receiver and fail the whole
// push. These tests pin that the projection strips the new keys for every older
// pin (and for an unprobed spoke, which gets the v0.3.0 baseline), and that a
// v0.11.0 spoke receives byte-for-byte what it received before v0.12.0.

const { VERSIONED_SCHEMAS, projectPayloadForVersion, PACKAGE_SCHEMA_VERSION, AgentProvisioningPayloadSchema } = pkg;
type Version = keyof typeof VERSIONED_SCHEMAS;
const schemas = VERSIONED_SCHEMAS as Record<string, { safeParse: (v: unknown) => { success: boolean; error?: unknown } } | undefined>;
const S = (v: string) => {
  const s = schemas[v];
  if (!s) throw new Error(`schema ${v} is not registered`);
  return s;
};

const NEW_BRANDING_KEYS = ["logoUrl", "primaryColor", "accentColor"] as const;
// v0.13.0 (sponsorLenderAgentId) extends v0.12.0 and carries the branding block, so it is not an older pin.
const OLDER_PINS = Object.keys(VERSIONED_SCHEMAS).filter((v) => v !== "v0.12.0" && v !== "v0.13.0");

const brandingNew = {
  logoUrl: "https://cdn.example.test/logo.png",
  primaryColor: "#123456",
  accentColor: null,
};

// What a v0.11.0 producer sent (Rello push-agent.ts @ 05df5bab).
const payload = (withNew: boolean) => ({
  tenantId: "t_1",
  syncedAt: "2026-11-27T00:00:00.000Z",
  action: "update",
  physicalAddress: null,
  tenantBranding: {
    terminology: { lead: "Client" },
    teamRoleCopy: { LOAN_OFFICER: { title: "Advisor" } },
    ...(withNew ? brandingNew : {}),
  },
  agent: {
    relloAgentId: "agent_1",
    relloUserId: "user_1",
    email: "brand@example.test",
    firstName: "Bea",
    lastName: "Brand",
    slug: "bea-brand",
    role: "MLO",
    phone: null,
    emailSignature: null,
    loginless: false,
    roles: ["MLO"],
  },
});

test("v0.12.0 is registered; v0.13.0 (sponsorLenderAgentId) builds on it", () => {
  // v0.13.0 moved PACKAGE_SCHEMA_VERSION and the latest alias on; v0.12.0 stays registered.
  assert.equal(PACKAGE_SCHEMA_VERSION, "v0.13.0");
  assert.equal("v0.12.0" in VERSIONED_SCHEMAS, true);
  assert.notEqual(VERSIONED_SCHEMAS["v0.12.0" as Version], AgentProvisioningPayloadSchema);
  assert.deepEqual([...pkg.TENANT_BRANDING_FIELDS_V0_12_0], [...NEW_BRANDING_KEYS]);
});

test("a v0.12.0 payload with each new branding field set, null, or absent parses", () => {
  assert.equal(S("v0.12.0").safeParse(payload(true)).success, true, "set + null");
  assert.equal(S("v0.12.0").safeParse(payload(false)).success, true, "absent: a v0.11.0 producer's payload still parses");
  const allNull = { ...payload(false), tenantBranding: { terminology: {}, teamRoleCopy: {}, logoUrl: null, primaryColor: null, accentColor: null } };
  assert.equal(S("v0.12.0").safeParse(allNull).success, true, "all null (cleared in Rello)");
});

test("v0.12.0 still refuses a malformed or unknown branding key (strict) and still requires terminology + teamRoleCopy", () => {
  const p = payload(true);
  assert.equal(S("v0.12.0").safeParse({ ...p, tenantBranding: { ...p.tenantBranding, primaryColor: 123 } }).success, false, "number, not string");
  assert.equal(S("v0.12.0").safeParse({ ...p, tenantBranding: { ...p.tenantBranding, secondaryColor: "#000000" } }).success, false, "branding stays strict");
  assert.equal(S("v0.12.0").safeParse({ ...p, tenantBranding: { logoUrl: null, primaryColor: null, accentColor: null } }).success, false, "terminology + teamRoleCopy still required");
});

test("every older schema (v0.3.0 to v0.11.0) refuses each new branding key, so the projection must strip them", () => {
  for (const v of OLDER_PINS) {
    const projected = projectPayloadForVersion(payload(false), v as Version).projected as { tenantBranding: Record<string, unknown> };
    for (const key of NEW_BRANDING_KEYS) {
      const withOne = { ...projected, tenantBranding: { ...projected.tenantBranding, [key]: "x" } };
      assert.equal(S(v).safeParse(withOne).success, false, `${v} must not declare tenantBranding.${key}`);
    }
  }
});

test("projection to v0.11.0 is byte-equal to what a v0.11.0 spoke received before v0.12.0", () => {
  const before = projectPayloadForVersion(payload(false), "v0.11.0");
  const after = projectPayloadForVersion(payload(true), "v0.11.0");
  assert.equal(JSON.stringify(after.projected), JSON.stringify(before.projected));
  assert.equal(JSON.stringify(after.projected), JSON.stringify(payload(false)));
  assert.equal(S("v0.11.0").safeParse(after.projected).success, true, "a strict v0.11.0 receiver accepts it");
  for (const key of NEW_BRANDING_KEYS) {
    assert.ok(after.omittedFields.includes(`tenantBranding.${key}`), `omittedFields reports tenantBranding.${key}: ${after.omittedFields.join(",")}`);
  }
});

test("projection to every older pin parses under that pin's strict schema and equals its pre-v0.12.0 payload", () => {
  for (const v of OLDER_PINS) {
    const out = projectPayloadForVersion(payload(true), v as Version);
    const parsed = S(v).safeParse(out.projected);
    assert.equal(parsed.success, true, `${v}: ${JSON.stringify(parsed.error ?? "")}`);
    const expected = projectPayloadForVersion(payload(false), v as Version).projected;
    assert.equal(JSON.stringify(out.projected), JSON.stringify(expected), `${v} receives exactly its pre-v0.12.0 payload`);
  }
});

test("an unprobed spoke (no recorded version) gets the v0.3.0 baseline branding shape", () => {
  for (const target of [null, undefined, "v9.9.9"]) {
    const out = projectPayloadForVersion(payload(true), target);
    assert.equal(out.resolvedVersion, "v0.3.0");
    assert.deepEqual(Object.keys((out.projected as { tenantBranding: object }).tenantBranding), ["terminology", "teamRoleCopy"]);
  }
});

test("projection to v0.12.0 keeps every new field, null included", () => {
  const out = projectPayloadForVersion(payload(true), "v0.12.0");
  const tb = (out.projected as { tenantBranding: Record<string, unknown> }).tenantBranding;
  for (const key of NEW_BRANDING_KEYS) {
    assert.ok(key in tb, `tenantBranding.${key} kept`);
    assert.deepEqual(tb[key], brandingNew[key]);
  }
  assert.deepEqual(out.omittedFields, []);
  assert.deepEqual(out.droppedNulls, []);
  assert.equal(S("v0.12.0").safeParse(out.projected).success, true);
});
