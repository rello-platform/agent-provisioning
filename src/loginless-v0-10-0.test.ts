import { test } from "node:test";
import assert from "node:assert/strict";
import * as pkg from "./index.js";

// PFP Gateway X2a (SPEC-PFP-GATEWAY.md rev 10.30 §6 [D30]; Platform KA prompts
// 1153/1155): v0.10.0 adds `agent.loginless`, true for a D30 extra-signature loan
// officer (a Rello Agent that never has a login). Rello always sends it, true or
// false; a receiver reads an absent key as UNKNOWN, never as "has a login". The
// projection strips it for every spoke pinned below v0.10.0, so no strict
// receiver ever sees a key it does not declare.

const { AgentProvisioningPayloadSchema, VERSIONED_SCHEMAS, projectPayloadForVersion, PACKAGE_SCHEMA_VERSION } = pkg;
const schemas = VERSIONED_SCHEMAS as Record<string, { safeParse: (v: unknown) => { success: boolean } } | undefined>;
const S = (v: string) => {
  const s = schemas[v];
  if (!s) throw new Error(`schema ${v} is not registered`);
  return s;
};

const agent = (loginless?: boolean) => ({
  relloAgentId: "agent_1",
  relloUserId: null,
  email: "extra-mlo@example.test",
  firstName: "Eli",
  lastName: "Extra",
  slug: "eli-extra",
  role: "MLO",
  phone: null,
  emailSignature: null,
  roles: [],
  licenses: {},
  ...(loginless === undefined ? {} : { loginless }),
});
const payload = (loginless?: boolean) => ({
  tenantId: "t_1",
  syncedAt: "2026-11-15T00:00:00.000Z",
  action: "add",
  physicalAddress: null,
  tenantBranding: { terminology: {}, teamRoleCopy: {} },
  agent: agent(loginless),
});

test("v0.10.0 is registered and is the package's own version", () => {
  assert.equal(PACKAGE_SCHEMA_VERSION, "v0.10.0");
  assert.equal("v0.10.0" in VERSIONED_SCHEMAS, true);
  assert.equal(VERSIONED_SCHEMAS["v0.10.0" as keyof typeof VERSIONED_SCHEMAS], AgentProvisioningPayloadSchema);
});

test("a v0.10.0 payload with loginless true or false parses; a non-boolean is refused", () => {
  assert.equal(S("v0.10.0").safeParse(payload(true)).success, true);
  assert.equal(S("v0.10.0").safeParse(payload(false)).success, true);
  assert.equal(S("v0.10.0").safeParse(payload()).success, true, "optional: an older producer's payload still parses");
  const bad = { ...payload(), agent: { ...agent(), loginless: "true" } };
  assert.equal(S("v0.10.0").safeParse(bad).success, false);
});

test("every schema below v0.10.0 refuses agent.loginless (strict), so the projection must strip it", () => {
  for (const v of Object.keys(VERSIONED_SCHEMAS)) {
    if (v === "v0.10.0") continue;
    const projected = projectPayloadForVersion(payload(true), v as keyof typeof VERSIONED_SCHEMAS);
    assert.equal(S(v).safeParse({ ...projected.projected, agent: { ...(projected.projected as { agent: object }).agent, loginless: true } }).success, false, `${v} must not declare agent.loginless`);
  }
});

test("projection to v0.9.0 drops agent.loginless and reports it; projection to v0.10.0 keeps it", () => {
  const down = projectPayloadForVersion(payload(true), "v0.9.0");
  assert.equal("loginless" in (down.projected as { agent: Record<string, unknown> }).agent, false);
  assert.ok(down.omittedFields.includes("agent.loginless"), `omittedFields: ${down.omittedFields.join(",")}`);
  assert.equal(S("v0.9.0").safeParse(down.projected).success, true);

  const same = projectPayloadForVersion(payload(false), "v0.10.0");
  assert.equal((same.projected as { agent: Record<string, unknown> }).agent.loginless, false);
  assert.equal(S("v0.10.0").safeParse(same.projected).success, true);
});
