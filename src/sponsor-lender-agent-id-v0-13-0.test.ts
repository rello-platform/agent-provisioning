import { test } from "node:test";
import assert from "node:assert/strict";
import * as pkg from "./index.js";

// Home Insight HI-55 (spec RELLO-HOME-INSIGHT §9; KA ruling 2026-11-28 09:24Z):
// v0.13.0 adds `agent.sponsorLenderAgentId`, the Rello Agent.id of the loan
// officer who sponsors this agent's Home Insight seat (an ACTIVE
// HomeInsightSponsorship). THREE MEANINGS, the v0.9.0 D-349 rule:
//   key absent → the sender says nothing: NO CHANGE;
//   `null`     → no sponsor: CLEAR the mirror;
//   a value    → the sponsoring loan officer's Agent.id: SET the mirror.
// Every schema is `.strict()`, and a spoke pinned below v0.13.0 (Home Scout's
// receiver 400s an unknown key) must never see it: projectPayloadForVersion
// strips it for every older or unprobed target.

const { AgentProvisioningPayloadSchema, VERSIONED_SCHEMAS, projectPayloadForVersion, PACKAGE_SCHEMA_VERSION } = pkg;
const schemas = VERSIONED_SCHEMAS as Record<string, { safeParse: (v: unknown) => { success: boolean } } | undefined>;
const S = (v: string) => {
  const s = schemas[v];
  if (!s) throw new Error(`schema ${v} is not registered`);
  return s;
};

const NEW = "v0.13.0";
const SPONSOR = "agent_mlo_sponsor_1";

const agent = (sponsor?: string | null) => ({
  relloAgentId: "agent_1",
  relloUserId: null,
  email: "sponsored-agent@example.test",
  firstName: "Ana",
  lastName: "Agent",
  slug: "ana-agent",
  role: "AGENT",
  phone: null,
  emailSignature: null,
  roles: [],
  licenses: {},
  ...(sponsor === undefined ? {} : { sponsorLenderAgentId: sponsor }),
});
const payload = (sponsor?: string | null) => ({
  tenantId: "t_1",
  syncedAt: "2026-11-28T09:30:00.000Z",
  action: "add",
  physicalAddress: null,
  tenantBranding: { terminology: {}, teamRoleCopy: {} },
  agent: agent(sponsor),
});
const agentOf = (p: unknown) => (p as { agent: Record<string, unknown> }).agent;

test("v0.13.0 is registered and is the package's version and latest alias", () => {
  assert.equal(PACKAGE_SCHEMA_VERSION, NEW);
  assert.equal(VERSIONED_SCHEMAS[NEW as keyof typeof VERSIONED_SCHEMAS], AgentProvisioningPayloadSchema);
});

test("a v0.13.0 payload carrying sponsorLenderAgentId parses and keeps it", () => {
  const r = S(NEW).safeParse(payload(SPONSOR)) as { success: boolean; data?: unknown };
  assert.equal(r.success, true);
  assert.equal(agentOf(r.data).sponsorLenderAgentId, SPONSOR);
});

test("null (no sponsor) and absent (no change) both parse at v0.13.0; an empty or non-string id is refused", () => {
  const n = S(NEW).safeParse(payload(null)) as { success: boolean; data?: unknown };
  assert.equal(n.success, true);
  assert.equal(agentOf(n.data).sponsorLenderAgentId, null);
  const a = S(NEW).safeParse(payload()) as { success: boolean; data?: unknown };
  assert.equal(a.success, true);
  assert.equal("sponsorLenderAgentId" in agentOf(a.data), false);
  assert.equal(S(NEW).safeParse(payload("")).success, false);
  assert.equal(S(NEW).safeParse({ ...payload(), agent: { ...agent(), sponsorLenderAgentId: 7 } }).success, false);
});

test("every older version's strict schema refuses agent.sponsorLenderAgentId (so an old spoke never sees it)", () => {
  const older = Object.keys(VERSIONED_SCHEMAS).filter((v) => v !== NEW);
  assert.ok(older.length >= 11, `older versions: ${older.join(",")}`);
  for (const v of older) {
    const projected = projectPayloadForVersion(payload(), v).projected;
    assert.equal(S(v).safeParse(projected).success, true, `${v}: the projected payload without the field parses`);
    const withField = { ...projected, agent: { ...agentOf(projected), sponsorLenderAgentId: SPONSOR } };
    assert.equal(S(v).safeParse(withField).success, false, `${v} must not declare agent.sponsorLenderAgentId`);
  }
});

test("projection to every older (and an unprobed) version drops the field, reports it, and the result parses", () => {
  const targets: Array<string | null> = [...Object.keys(VERSIONED_SCHEMAS).filter((v) => v !== NEW), null, "v9.9.9"];
  for (const v of targets) {
    for (const value of [SPONSOR, null]) {
      const out = projectPayloadForVersion(payload(value), v);
      assert.equal("sponsorLenderAgentId" in agentOf(out.projected), false, `${String(v)} (${String(value)}) kept the field`);
      assert.ok(out.omittedFields.includes("agent.sponsorLenderAgentId"), `${String(v)}: omittedFields ${out.omittedFields.join(",")}`);
      assert.equal(S(out.resolvedVersion).safeParse(out.projected).success, true, `${String(v)} projected payload must parse`);
    }
  }
});

test("projection to v0.13.0 keeps the value and the null", () => {
  for (const value of [SPONSOR, null]) {
    const out = projectPayloadForVersion(payload(value), NEW);
    assert.equal(agentOf(out.projected).sponsorLenderAgentId, value);
    assert.deepEqual(out.omittedFields, []);
    assert.deepEqual(out.droppedNulls, []);
    assert.equal(S(NEW).safeParse(out.projected).success, true);
  }
});
