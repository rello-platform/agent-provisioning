import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AgentProvisioningPayloadSchema,
  AgentProvisioningPayloadSchema_v0_7_1,
  AgentProvisioningPayloadSchema_v0_9_0,
  NULLABLE_AGENT_FIELDS_V0_9_0,
  VERSIONED_SCHEMAS,
  projectPayloadForVersion,
} from "./index.js";

// D-349 — absent is not null. v0.9.0 makes 13 agent identity strings nullable
// (absent = no change, null = clear, value = set); the projection keeps every
// spoke pinned < v0.9.0 on exactly the payload it received before v0.9.0.

const FIELDS = [...NULLABLE_AGENT_FIELDS_V0_9_0];

test("the nullable set is exactly the 13 ruled fields", () => {
  assert.deepEqual([...FIELDS].sort(), [
    "applicationUrl", "bio", "brokerageLicenseNumber", "brokerageLogoUrl", "brokerageName",
    "licenseNumber", "licenseState", "mloName", "mloNmls", "photoUrl", "tagline", "title", "websiteUrl",
  ]);
});

const agentBase = {
  relloAgentId: "agent_1",
  relloUserId: "user_1",
  email: "agent@example.test",
  firstName: "Ann",
  lastName: "Agent",
  slug: "ann-agent",
  role: "MLO",
  phone: null,
  emailSignature: null,
  roles: ["MLO"],
  licenses: { mlo: { nmlsNumber: "100", states: ["UT"], firmLicense: "3146" } },
};
const outer = {
  tenantId: "t_1",
  syncedAt: "2026-10-07T00:00:00.000Z",
  action: "update" as const,
  physicalAddress: null,
  tenantBranding: { terminology: {}, teamRoleCopy: {} },
};

/** What Rello sends after D-349: every cleared field as an explicit null. */
function clearedAsNull(): Record<string, unknown> {
  const agent: Record<string, unknown> = { ...agentBase, title: "Loan Officer" };
  for (const f of FIELDS) if (!(f in agent)) agent[f] = null;
  return { ...outer, agent };
}
/** What Rello sent before D-349 for the same agent: `?? undefined`, so the key is dropped on the wire. */
function clearedAsUndefined(): Record<string, unknown> {
  const agent: Record<string, unknown> = { ...agentBase, title: "Loan Officer" };
  for (const f of FIELDS) if (!(f in agent)) agent[f] = undefined;
  return { ...outer, agent };
}

for (const f of FIELDS) {
  test(`v0.9.0 accepts ${f}: absent, null and a value; v0.7.1 rejects its null`, () => {
    const base = { ...outer, agent: { ...agentBase } };
    assert.equal(AgentProvisioningPayloadSchema_v0_9_0.safeParse(base).success, true, "absent");
    assert.equal(AgentProvisioningPayloadSchema_v0_9_0.safeParse({ ...outer, agent: { ...agentBase, [f]: null } }).success, true, "null");
    assert.equal(AgentProvisioningPayloadSchema_v0_9_0.safeParse({ ...outer, agent: { ...agentBase, [f]: "x" } }).success, true, "value");
    assert.equal(AgentProvisioningPayloadSchema_v0_7_1.safeParse({ ...outer, agent: { ...agentBase, [f]: null } }).success, false, "v0.7.1 null");
  });
}

test("the latest alias is v0.9.0 and keeps null as null (no coercion)", () => {
  assert.equal(AgentProvisioningPayloadSchema, AgentProvisioningPayloadSchema_v0_9_0);
  const parsed = AgentProvisioningPayloadSchema.parse(clearedAsNull());
  const agent = parsed.agent as Record<string, unknown>;
  for (const f of FIELDS.filter((x) => x !== "title")) {
    assert.equal(f in agent, true, `${f} present after parse`);
    assert.equal(agent[f], null, `${f} is null after parse`);
  }
  assert.equal("brokerageLicenseNumber" in AgentProvisioningPayloadSchema.parse({ ...outer, agent: agentBase }).agent, false);
});

const OLDER = (Object.keys(VERSIONED_SCHEMAS) as (keyof typeof VERSIONED_SCHEMAS)[]).filter((v) => v !== "v0.9.0");

for (const target of [...OLDER, null, "v9.9.9"]) {
  test(`projection for ${target ?? "an unprobed spoke"}: a null-carrying payload is byte-identical to today's, and parses`, () => {
    const now = projectPayloadForVersion(clearedAsNull(), target);
    const before = projectPayloadForVersion(clearedAsUndefined(), target);
    assert.equal(JSON.stringify(now.projected), JSON.stringify(before.projected));
    assert.deepEqual(now.omittedFields, before.omittedFields);
    const schema = VERSIONED_SCHEMAS[now.resolvedVersion];
    assert.equal(schema.safeParse(now.projected).success, true);
    // Every one of the 13 nulls was dropped — and nothing else.
    const expected = FIELDS.filter((f) => f !== "title").map((f) => `agent.${f}`);
    assert.deepEqual([...now.droppedNulls].sort(), expected.sort());
    // Nulls the older schema CAN parse are kept: phone always, emailSignature where declared.
    assert.equal((now.projected.agent as Record<string, unknown>).phone, null);
  });
}

test("the v0.8.0 spoke case, named: a spoke on package v0.8.0 advertises v0.7.1 and gets today's payload", () => {
  const now = projectPayloadForVersion(clearedAsNull(), "v0.7.1");
  const agent = now.projected.agent as Record<string, unknown>;
  assert.equal("brokerageLicenseNumber" in agent, false);
  assert.equal(agent.title, "Loan Officer");
  assert.equal(agent.emailSignature, null);
  assert.equal(AgentProvisioningPayloadSchema_v0_7_1.safeParse(now.projected).success, true);
  // And the null that a v0.8.0 receiver would 400 on is exactly what would reach it unprojected:
  assert.equal(AgentProvisioningPayloadSchema_v0_7_1.safeParse(clearedAsNull()).success, false);
});

test("projection for v0.9.0 keeps every null — that spoke clears", () => {
  const now = projectPayloadForVersion(clearedAsNull(), "v0.9.0");
  const agent = now.projected.agent as Record<string, unknown>;
  for (const f of FIELDS.filter((x) => x !== "title")) assert.equal(agent[f], null, f);
  assert.deepEqual(now.droppedNulls, []);
  assert.equal(AgentProvisioningPayloadSchema_v0_9_0.safeParse(now.projected).success, true);
});

test("a set value is projected unchanged for every version", () => {
  for (const target of [...OLDER, "v0.9.0"]) {
    const p = projectPayloadForVersion({ ...outer, agent: { ...agentBase, brokerageLicenseNumber: "3146" } }, target);
    assert.equal((p.projected.agent as Record<string, unknown>).brokerageLicenseNumber, "3146", target);
  }
});

test("agentProfile nulls are not touched by the agent-block rule", () => {
  const payload = { ...outer, agent: agentBase, agentProfile: { typicalClient: [], areasServed: [], designations: [], avoidTopics: [], emphasizeTopics: [], sensitiveTopics: [], specialtySentence: null } };
  const p = projectPayloadForVersion(payload, "v0.7.1");
  assert.equal((p.projected.agentProfile as Record<string, unknown>).specialtySentence, null);
  assert.deepEqual(p.droppedNulls, []);
});
