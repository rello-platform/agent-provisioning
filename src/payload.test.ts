import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AgentProvisioningPayloadSchema,
  AgentProvisioningPayloadSchema_v0_3_0,
  AgentProvisioningPayloadSchema_v0_6_0,
  AgentProvisioningPayloadSchema_v0_7_0,
  AgentProvisioningPayloadSchema_v0_7_1,
  AgentProfilePayloadSchema_v0_7_1,
  AgentPayloadSchema,
  AgentPayloadSchema_v0_3_0,
  AgentPayloadSchema_v0_6_0,
  AgentPayloadSchema_v0_7_0,
  AgentProfilePayloadSchema,
  TenantBrandingPayloadSchema,
  AgentNotificationPreferencePayloadSchema,
  PACKAGE_SCHEMA_VERSION,
  projectPayloadForVersion,
} from "./index.js";

// Shared minimal agent fixture for the latest (v0.6.0) schema — carries the
// required `relloUserId` (a Rello User.id; the value Rello OIDC issues as
// `sub`). Use this in any v0.6.0 / latest-schema fixture.
const AGENT_V6 = {
  relloAgentId: "a_123",
  email: "a@e.com",
  firstName: "T",
  lastName: "A",
  slug: "t-a",
  role: "AGENT",
  phone: null,
  relloUserId: "user_123",
};

test("AgentProvisioningPayloadSchema accepts a minimal valid payload", () => {
  const minimal = {
    tenantId: "t_123",
    syncedAt: "2026-05-11T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: {
      relloAgentId: "a_123",
      email: "agent@example.com",
      firstName: "Test",
      lastName: "Agent",
      slug: "test-agent",
      role: "AGENT",
      phone: null,
    },
  };
  const parsed = AgentProvisioningPayloadSchema.safeParse(minimal);
  assert.equal(parsed.success, true);
});

test("AgentProvisioningPayloadSchema rejects unknown top-level fields (strict)", () => {
  const payload = {
    tenantId: "t_123",
    syncedAt: "2026-05-11T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: {
      relloAgentId: "a_123",
      email: "a@e.com",
      firstName: "T",
      lastName: "A",
      slug: "t-a",
      role: "AGENT",
      phone: null,
    },
    unknownField: "should-reject",
  };
  const parsed = AgentProvisioningPayloadSchema.safeParse(payload);
  assert.equal(parsed.success, false);
});

test("AgentPayloadSchema rejects unknown nested fields (strict)", () => {
  const agent = {
    relloAgentId: "a_123",
    email: "a@e.com",
    firstName: "T",
    lastName: "A",
    slug: "t-a",
    role: "AGENT",
    phone: null,
    unknownNested: "should-reject",
  };
  const parsed = AgentPayloadSchema.safeParse(agent);
  assert.equal(parsed.success, false);
});

test("TenantBrandingPayloadSchema requires both terminology and teamRoleCopy", () => {
  assert.equal(TenantBrandingPayloadSchema.safeParse({ terminology: {} }).success, false);
  assert.equal(TenantBrandingPayloadSchema.safeParse({ teamRoleCopy: {} }).success, false);
  assert.equal(TenantBrandingPayloadSchema.safeParse({ terminology: {}, teamRoleCopy: {} }).success, true);
});

test("AgentProvisioningPayloadSchema rejects invalid action enum", () => {
  const payload = {
    tenantId: "t_123",
    syncedAt: "2026-05-11T00:00:00.000Z",
    action: "delete", // not in enum
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: {
      relloAgentId: "a_123",
      email: "a@e.com",
      firstName: "T",
      lastName: "A",
      slug: "t-a",
      role: "AGENT",
      phone: null,
    },
  };
  assert.equal(AgentProvisioningPayloadSchema.safeParse(payload).success, false);
});

test("force flag must be literal-true if present", () => {
  const base = {
    tenantId: "t_123",
    syncedAt: "2026-05-11T00:00:00.000Z",
    action: "update" as const,
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: {
      relloAgentId: "a_123",
      email: "a@e.com",
      firstName: "T",
      lastName: "A",
      slug: "t-a",
      role: "AGENT",
      phone: null,
    },
  };
  assert.equal(AgentProvisioningPayloadSchema.safeParse({ ...base, force: true }).success, true);
  assert.equal(AgentProvisioningPayloadSchema.safeParse({ ...base, force: false }).success, false);
});

test("AgentNotificationPreferencePayloadSchema accepts a complete preference set", () => {
  const valid = {
    notifyByEmail: true,
    notifyBySms: false,
    notifyByPush: true,
    dailyDigest: true,
    weeklyAnalytics: false,
  };
  const parsed = AgentNotificationPreferencePayloadSchema.safeParse(valid);
  assert.equal(parsed.success, true);
});

test("AgentNotificationPreferencePayloadSchema rejects missing required fields", () => {
  const partial = { notifyByEmail: true };
  const parsed = AgentNotificationPreferencePayloadSchema.safeParse(partial);
  assert.equal(parsed.success, false);
});

test("AgentNotificationPreferencePayloadSchema rejects unknown fields (strict)", () => {
  const withExtra = {
    notifyByEmail: true, notifyBySms: false, notifyByPush: false,
    dailyDigest: true, weeklyAnalytics: false,
    leadAlerts: true,  // not yet in v0.2.0
  };
  const parsed = AgentNotificationPreferencePayloadSchema.safeParse(withExtra);
  assert.equal(parsed.success, false);
});

test("AgentProvisioningPayloadSchema accepts payload with agentNotificationPreference", () => {
  const minimal = {
    tenantId: "t_123",
    syncedAt: "2026-05-11T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: {
      relloAgentId: "a_123",
      email: "agent@example.com",
      firstName: "Test", lastName: "Agent",
      slug: "test-agent", role: "AGENT", phone: null,
    },
    agentNotificationPreference: {
      notifyByEmail: true, notifyBySms: false, notifyByPush: false,
      dailyDigest: true, weeklyAnalytics: false,
    },
  };
  assert.equal(AgentProvisioningPayloadSchema.safeParse(minimal).success, true);
});

test("AgentProvisioningPayloadSchema accepts payload WITHOUT agentNotificationPreference (optional)", () => {
  const minimal = {
    tenantId: "t_123",
    syncedAt: "2026-05-11T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: {
      relloAgentId: "a_123", email: "a@e.com",
      firstName: "T", lastName: "A", slug: "t-a", role: "AGENT", phone: null,
    },
  };
  assert.equal(AgentProvisioningPayloadSchema.safeParse(minimal).success, true);
});

test("AgentProvisioningPayloadSchema accepts agentNotificationPreference: null", () => {
  const minimal = {
    tenantId: "t_123",
    syncedAt: "2026-05-11T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: {
      relloAgentId: "a_123", email: "a@e.com",
      firstName: "T", lastName: "A", slug: "t-a", role: "AGENT", phone: null,
    },
    agentNotificationPreference: null,
  };
  assert.equal(AgentProvisioningPayloadSchema.safeParse(minimal).success, true);
});

test("AgentPayloadSchema accepts emailSignature when present", () => {
  const agent = {
    relloAgentId: "a_123", email: "a@e.com",
    firstName: "T", lastName: "A", slug: "t-a", role: "AGENT", phone: null,
    emailSignature: "Best regards,\nJane Smith | REALTOR®",
  };
  assert.equal(AgentPayloadSchema.safeParse(agent).success, true);
});

test("AgentPayloadSchema accepts emailSignature: null", () => {
  const agent = {
    relloAgentId: "a_123", email: "a@e.com",
    firstName: "T", lastName: "A", slug: "t-a", role: "AGENT", phone: null,
    emailSignature: null,
  };
  assert.equal(AgentPayloadSchema.safeParse(agent).success, true);
});

test("AgentPayloadSchema accepts agent WITHOUT emailSignature (optional)", () => {
  const agent = {
    relloAgentId: "a_123", email: "a@e.com",
    firstName: "T", lastName: "A", slug: "t-a", role: "AGENT", phone: null,
  };
  assert.equal(AgentPayloadSchema.safeParse(agent).success, true);
});

test("AgentProvisioningPayloadSchema integration — agent has emailSignature", () => {
  const minimal = {
    tenantId: "t_123",
    syncedAt: "2026-05-11T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: {
      relloAgentId: "a_123", email: "a@e.com",
      firstName: "T", lastName: "A", slug: "t-a", role: "AGENT", phone: null,
      emailSignature: "Test signature",
    },
  };
  assert.equal(AgentProvisioningPayloadSchema.safeParse(minimal).success, true);
});

// ── PFP MLO Mini-Wizard fields (v0.4.0 — SPEC-RELLO-AGENT-PROFILE-MLO-EXTENSION) ──

const baseProfile = {
  typicalClient: [],
  areasServed: [],
  designations: [],
  avoidTopics: [],
  emphasizeTopics: [],
  sensitiveTopics: [],
};

test("AgentProfilePayloadSchema accepts all 7 PFP MLO fields with valid values", () => {
  const profile = {
    ...baseProfile,
    licensedStates: ["UT", "ID", "NV"],
    pfpDefaultLender: "Big Star Mortgage",
    pfpDefaultLoanPrograms: ["CONV", "FHA", "VA"],
    pfpDefaultRateSource: "MND Daily",
    pfpEqualHousingLogoPlacement: "footer",
    pfpDefaultCreditPullPreference: "soft",
    pfpWizardCompletedAt: "2026-05-18T00:00:00.000Z",
  };
  assert.equal(AgentProfilePayloadSchema.safeParse(profile).success, true);
});

test("AgentProfilePayloadSchema accepts payload WITHOUT PFP MLO fields (optional)", () => {
  assert.equal(AgentProfilePayloadSchema.safeParse(baseProfile).success, true);
});

test("AgentProfilePayloadSchema rejects licensedStates with non-2-letter code", () => {
  const profile = { ...baseProfile, licensedStates: ["UT", "Utah"] };
  assert.equal(AgentProfilePayloadSchema.safeParse(profile).success, false);
});

test("AgentProfilePayloadSchema rejects licensedStates with lowercase code", () => {
  const profile = { ...baseProfile, licensedStates: ["ut"] };
  assert.equal(AgentProfilePayloadSchema.safeParse(profile).success, false);
});

test("AgentProfilePayloadSchema rejects pfpDefaultLoanPrograms with off-list value", () => {
  const profile = { ...baseProfile, pfpDefaultLoanPrograms: ["CONV", "REVERSE"] };
  assert.equal(AgentProfilePayloadSchema.safeParse(profile).success, false);
});

test("AgentProfilePayloadSchema rejects pfpEqualHousingLogoPlacement off-list value", () => {
  const profile = { ...baseProfile, pfpEqualHousingLogoPlacement: "sidebar" };
  assert.equal(AgentProfilePayloadSchema.safeParse(profile).success, false);
});

test("AgentProfilePayloadSchema rejects pfpDefaultCreditPullPreference off-list value", () => {
  const profile = { ...baseProfile, pfpDefaultCreditPullPreference: "tri-merge" };
  assert.equal(AgentProfilePayloadSchema.safeParse(profile).success, false);
});

test("AgentProfilePayloadSchema accepts null values on nullable PFP fields", () => {
  const profile = {
    ...baseProfile,
    pfpDefaultLender: null,
    pfpDefaultRateSource: null,
    pfpEqualHousingLogoPlacement: null,
    pfpDefaultCreditPullPreference: null,
    pfpWizardCompletedAt: null,
  };
  assert.equal(AgentProfilePayloadSchema.safeParse(profile).success, true);
});

test("AgentProfilePayloadSchema rejects pfpDefaultLender exceeding max(200)", () => {
  const profile = { ...baseProfile, pfpDefaultLender: "x".repeat(201) };
  assert.equal(AgentProfilePayloadSchema.safeParse(profile).success, false);
});

test("AgentProvisioningPayloadSchema integration — agentProfile carries PFP MLO fields", () => {
  const payload = {
    tenantId: "t_123",
    syncedAt: "2026-05-18T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: {
      relloAgentId: "a_123", email: "a@e.com",
      firstName: "T", lastName: "A", slug: "t-a", role: "AGENT", phone: null,
    },
    agentProfile: {
      ...baseProfile,
      licensedStates: ["UT"],
      pfpDefaultLender: "Big Star",
      pfpDefaultLoanPrograms: ["CONV"],
      pfpEqualHousingLogoPlacement: "footer",
      pfpDefaultCreditPullPreference: "soft",
      pfpWizardCompletedAt: "2026-05-18T00:00:00.000Z",
    },
  };
  assert.equal(AgentProvisioningPayloadSchema.safeParse(payload).success, true);
});

// ── v0.6.0 — relloUserId identity-space disambiguation (DISPATCH-T5D) ────────

test("PACKAGE_SCHEMA_VERSION is v0.7.1", () => {
  assert.equal(PACKAGE_SCHEMA_VERSION, "v0.7.1");
});

test("v0.6.0 agent schema accepts a string relloUserId", () => {
  assert.equal(
    AgentPayloadSchema_v0_6_0.safeParse({ ...AGENT_V6, relloUserId: "user_abc" }).success,
    true,
  );
});

test("v0.6.0 agent schema accepts relloUserId: null (login-less agent)", () => {
  assert.equal(
    AgentPayloadSchema_v0_6_0.safeParse({ ...AGENT_V6, relloUserId: null }).success,
    true,
  );
});

test("v0.6.0 agent schema accepts agent WITHOUT relloUserId (optional — strict-additive cadence, DL5)", () => {
  const { relloUserId, ...withoutUserId } = AGENT_V6;
  void relloUserId;
  assert.equal(AgentPayloadSchema_v0_6_0.safeParse(withoutUserId).success, true);
});

test("v0.6.0 agent schema rejects empty-string relloUserId (min(1))", () => {
  assert.equal(
    AgentPayloadSchema_v0_6_0.safeParse({ ...AGENT_V6, relloUserId: "" }).success,
    false,
  );
});

test("BACK-COMPAT: v0.3.0 agent schema REJECTS relloUserId (strict — field is genuinely versioned, not leaked into old schema)", () => {
  const { relloUserId, ...baseline } = AGENT_V6;
  void relloUserId;
  // baseline (no relloUserId) validates against v0.3.0 ...
  assert.equal(AgentPayloadSchema_v0_3_0.safeParse(baseline).success, true);
  // ... but adding relloUserId to a v0.3.0 agent is a strict-reject.
  assert.equal(AgentPayloadSchema_v0_3_0.safeParse(AGENT_V6).success, false);
});

test("latest AgentPayloadSchema === v0.6.0 (accepts relloUserId; back-compatible without it)", () => {
  const { relloUserId, ...baseline } = AGENT_V6;
  void relloUserId;
  // strict-additive: latest still parses a pre-v0.6.0 agent (no relloUserId) ...
  assert.equal(AgentPayloadSchema.safeParse(baseline).success, true);
  // ... and accepts the new field.
  assert.equal(AgentPayloadSchema.safeParse(AGENT_V6).success, true);
});

test("v0.6.0 outer schema integration — full payload with agent.relloUserId", () => {
  const payload = {
    tenantId: "t_123",
    syncedAt: "2026-05-28T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: { ...AGENT_V6, relloUserId: "user_1774748302563_80h3ay" },
  };
  assert.equal(AgentProvisioningPayloadSchema_v0_6_0.safeParse(payload).success, true);
});

// ── Projection (project-for-version.ts) — `agent` ∈ NESTED_KEYS ──────────────

function fullV6Payload() {
  return {
    tenantId: "t_123",
    syncedAt: "2026-05-28T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: { ...AGENT_V6, relloUserId: "user_abc" },
    agentProfile: {
      ...baseProfile,
      licensedStates: ["UT"],
      pfpDefaultLender: "Big Star",
    },
  };
}

test("projection to v0.6.0 KEEPS agent.relloUserId", () => {
  const { projected, omittedFields, resolvedVersion } = projectPayloadForVersion(
    fullV6Payload(),
    "v0.6.0",
  );
  assert.equal(resolvedVersion, "v0.6.0");
  assert.equal((projected.agent as Record<string, unknown>).relloUserId, "user_abc");
  assert.equal(omittedFields.includes("agent.relloUserId"), false);
});

test("projection to v0.4.0 STRIPS agent.relloUserId (spoke pinned < v0.6.0 never sees the novel field)", () => {
  const { projected, omittedFields, resolvedVersion } = projectPayloadForVersion(
    fullV6Payload(),
    "v0.4.0",
  );
  assert.equal(resolvedVersion, "v0.4.0");
  assert.equal("relloUserId" in (projected.agent as Record<string, unknown>), false);
  assert.equal(omittedFields.includes("agent.relloUserId"), true);
  // v0.4.0 PFP profile fields are still retained.
  assert.equal((projected.agentProfile as Record<string, unknown>).pfpDefaultLender, "Big Star");
});

test("projection to v0.5.0 maps to the v0.4.0-shape schema (NOT baseline v0.3.0) — keeps PFP fields, strips relloUserId", () => {
  const { projected, omittedFields, resolvedVersion } = projectPayloadForVersion(
    fullV6Payload(),
    "v0.5.0",
  );
  assert.equal(resolvedVersion, "v0.5.0");
  // The v0.5.0 registration fix: PFP MLO fields survive (would be stripped if
  // v0.5.0 fell back to baseline v0.3.0).
  assert.equal((projected.agentProfile as Record<string, unknown>).pfpDefaultLender, "Big Star");
  // relloUserId still stripped (v0.5.0 agent shape is the baseline).
  assert.equal(omittedFields.includes("agent.relloUserId"), true);
});

test("projection to an unknown/null version falls back to BASELINE (v0.3.0) and strips both relloUserId and PFP fields", () => {
  const { omittedFields, resolvedVersion } = projectPayloadForVersion(fullV6Payload(), null);
  assert.equal(resolvedVersion, "v0.3.0");
  assert.equal(omittedFields.includes("agent.relloUserId"), true);
});

// ── v0.7.0 — DUAL-LICENSE (MLO + RE): agent.roles + agent.licenses ───────────

const DUAL_LICENSES = {
  mlo: {
    nmlsNumber: "123456",
    states: ["UT", "ID"],
    firmName: "Big Star Mortgage",
    firmLicense: "98765",
    firmLogoUrl: "https://example.com/mlo-logo.png",
  },
  re: {
    licenseNumber: "RE-555",
    states: ["UT"],
    firmName: "Summit Realty",
    firmLicense: "BR-111",
    firmLogoUrl: "https://example.com/re-logo.png",
  },
};

test("v0.7.0 agent schema accepts roles=['MLO','RE'] + full licenses.{mlo,re}", () => {
  const agent = { ...AGENT_V6, roles: ["MLO", "RE"], licenses: DUAL_LICENSES };
  assert.equal(AgentPayloadSchema_v0_7_0.safeParse(agent).success, true);
});

test("v0.7.0 agent schema accepts a single-hat agent (licenses.mlo only)", () => {
  const agent = {
    ...AGENT_V6,
    roles: ["MLO"],
    licenses: { mlo: DUAL_LICENSES.mlo },
  };
  assert.equal(AgentPayloadSchema_v0_7_0.safeParse(agent).success, true);
});

test("v0.7.0 agent schema accepts agent WITHOUT roles/licenses (optional — strict-additive cadence)", () => {
  assert.equal(AgentPayloadSchema_v0_7_0.safeParse(AGENT_V6).success, true);
});

test("v0.7.0 agent schema accepts empty roles + empty licenses object (zero-license agent)", () => {
  const agent = { ...AGENT_V6, roles: [], licenses: {} };
  assert.equal(AgentPayloadSchema_v0_7_0.safeParse(agent).success, true);
});

test("v0.7.0 licenses.mlo.<junk> unknown sub-key fails inner .strict() (drift surfaces)", () => {
  const agent = {
    ...AGENT_V6,
    roles: ["MLO"],
    licenses: { mlo: { ...DUAL_LICENSES.mlo, junkField: "x" } },
  };
  assert.equal(AgentPayloadSchema_v0_7_0.safeParse(agent).success, false);
});

test("v0.7.0 licenses.<junk> unknown facet key fails .strict()", () => {
  const agent = {
    ...AGENT_V6,
    licenses: { mlo: DUAL_LICENSES.mlo, dual: {} },
  };
  assert.equal(AgentPayloadSchema_v0_7_0.safeParse(agent).success, false);
});

test("BACK-COMPAT: v0.6.0 agent schema REJECTS roles/licenses (genuinely versioned, not leaked into old schema)", () => {
  assert.equal(
    AgentPayloadSchema_v0_6_0.safeParse({ ...AGENT_V6, roles: ["MLO"] }).success,
    false,
  );
  assert.equal(
    AgentPayloadSchema_v0_6_0.safeParse({ ...AGENT_V6, licenses: DUAL_LICENSES }).success,
    false,
  );
});

test("latest AgentPayloadSchema === v0.7.0 (accepts roles/licenses; back-compatible without them)", () => {
  assert.equal(AgentPayloadSchema.safeParse(AGENT_V6).success, true);
  assert.equal(
    AgentPayloadSchema.safeParse({ ...AGENT_V6, roles: ["MLO", "RE"], licenses: DUAL_LICENSES }).success,
    true,
  );
});

test("v0.7.0 outer schema integration — full payload with agent.roles + agent.licenses", () => {
  const payload = {
    tenantId: "t_123",
    syncedAt: "2026-06-07T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: { ...AGENT_V6, roles: ["MLO", "RE"], licenses: DUAL_LICENSES },
  };
  assert.equal(AgentProvisioningPayloadSchema_v0_7_0.safeParse(payload).success, true);
});

function fullV7Payload() {
  return {
    tenantId: "t_123",
    syncedAt: "2026-06-07T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: {
      ...AGENT_V6,
      relloUserId: "user_abc",
      roles: ["MLO", "RE"],
      licenses: DUAL_LICENSES,
    },
    agentProfile: { ...baseProfile, licensedStates: ["UT"], pfpDefaultLender: "Big Star" },
  };
}

test("projection to v0.7.0 KEEPS agent.roles + agent.licenses (empty omittedFields for them)", () => {
  const { projected, omittedFields, resolvedVersion } = projectPayloadForVersion(
    fullV7Payload(),
    "v0.7.0",
  );
  assert.equal(resolvedVersion, "v0.7.0");
  const agent = projected.agent as Record<string, unknown>;
  assert.deepEqual(agent.roles, ["MLO", "RE"]);
  assert.ok(agent.licenses);
  assert.equal(omittedFields.includes("agent.roles"), false);
  assert.equal(omittedFields.includes("agent.licenses"), false);
});

test("projection to v0.6.0 STRIPS agent.roles + agent.licenses WHOLE (laggard-safe), keeps relloUserId", () => {
  const { projected, omittedFields, resolvedVersion } = projectPayloadForVersion(
    fullV7Payload(),
    "v0.6.0",
  );
  assert.equal(resolvedVersion, "v0.6.0");
  const agent = projected.agent as Record<string, unknown>;
  assert.equal("roles" in agent, false);
  assert.equal("licenses" in agent, false);
  assert.equal(omittedFields.includes("agent.roles"), true);
  assert.equal(omittedFields.includes("agent.licenses"), true);
  // v0.6.0 still keeps relloUserId.
  assert.equal(agent.relloUserId, "user_abc");
});

test("projection to v0.3.0 (baseline) STRIPS roles/licenses AND relloUserId (all novel fields gone)", () => {
  const { projected, omittedFields, resolvedVersion } = projectPayloadForVersion(
    fullV7Payload(),
    "v0.3.0",
  );
  assert.equal(resolvedVersion, "v0.3.0");
  const agent = projected.agent as Record<string, unknown>;
  assert.equal("roles" in agent, false);
  assert.equal("licenses" in agent, false);
  assert.equal(omittedFields.includes("agent.roles"), true);
  assert.equal(omittedFields.includes("agent.licenses"), true);
  assert.equal(omittedFields.includes("agent.relloUserId"), true);
});

// ── v0.7.1 — PROD-INCIDENT PATCH: agentProfile.aboutMeFacts wire-type ────────
// The whole reason for this release: the v0.3.0 baseline typed aboutMeFacts as
// z.string(), but Rello has ALWAYS sent an array of { text, category } objects,
// so Rello's own pre-fan-out validate rejected the WHOLE payload and the
// AgentMutationDLQ dead-lettered platform-wide.

const ABOUT_ME_FACTS_REAL = [
  { text: "I love dogs alot", category: "personal" },
  { text: "I love to mountain bike", category: "hobby" },
  { text: "Married for 2 years", category: "family" },
  { text: "I have 7 kids.", category: "personal" },
  { text: "Local living here in Sandy by Granite Park", category: "community" },
  { text: "Love how accessible the canyons are", category: "community" },
  { text: "Love helping people get into their dream home", category: "career" },
];

test("v0.7.1 agentProfile ACCEPTS an array of { text, category } facts (the real Big Star value)", () => {
  const profile = { ...baseProfile, aboutMeFacts: ABOUT_ME_FACTS_REAL };
  assert.equal(AgentProfilePayloadSchema_v0_7_1.safeParse(profile).success, true);
});

test("v0.7.1 agentProfile TOLERATES future category values (no enum coupling on the wire)", () => {
  const profile = {
    ...baseProfile,
    aboutMeFacts: [{ text: "New angle", category: "some_future_category" }],
  };
  assert.equal(AgentProfilePayloadSchema_v0_7_1.safeParse(profile).success, true);
});

test("v0.7.1 agentProfile TOLERATES extra fact fields via .passthrough() (future-proof)", () => {
  const profile = {
    ...baseProfile,
    aboutMeFacts: [{ text: "fact", category: "career", weight: 3, addedAt: "2026-06-08" }],
  };
  assert.equal(AgentProfilePayloadSchema_v0_7_1.safeParse(profile).success, true);
});

test("v0.7.1 agentProfile accepts aboutMeFacts omitted (optional)", () => {
  assert.equal(AgentProfilePayloadSchema_v0_7_1.safeParse(baseProfile).success, true);
});

test("v0.7.1 agentProfile REJECTS a bare string aboutMeFacts (the old wrong wire type)", () => {
  const profile = { ...baseProfile, aboutMeFacts: "I love dogs alot" };
  assert.equal(AgentProfilePayloadSchema_v0_7_1.safeParse(profile).success, false);
});

test("v0.7.1 agentProfile REJECTS a fact whose text is not a string", () => {
  const profile = { ...baseProfile, aboutMeFacts: [{ text: 42, category: "career" }] };
  assert.equal(AgentProfilePayloadSchema_v0_7_1.safeParse(profile).success, false);
});

test("v0.7.1 agentProfile REJECTS a fact missing the required text key", () => {
  const profile = { ...baseProfile, aboutMeFacts: [{ category: "career" }] };
  assert.equal(AgentProfilePayloadSchema_v0_7_1.safeParse(profile).success, false);
});

test("v0.7.1 agentProfile still accepts the 7 PFP MLO fields (inherited from v0.4.0)", () => {
  const profile = {
    ...baseProfile,
    aboutMeFacts: ABOUT_ME_FACTS_REAL,
    licensedStates: ["UT"],
    pfpDefaultLender: "Big Star",
    pfpDefaultLoanPrograms: ["CONV"],
    pfpEqualHousingLogoPlacement: "footer",
    pfpDefaultCreditPullPreference: "soft",
    pfpWizardCompletedAt: "2026-05-18T00:00:00.000Z",
  };
  assert.equal(AgentProfilePayloadSchema_v0_7_1.safeParse(profile).success, true);
});

test("latest AgentProfilePayloadSchema === v0.7.1 (array aboutMeFacts accepted, bare string rejected)", () => {
  assert.equal(
    AgentProfilePayloadSchema.safeParse({ ...baseProfile, aboutMeFacts: ABOUT_ME_FACTS_REAL }).success,
    true,
  );
  assert.equal(
    AgentProfilePayloadSchema.safeParse({ ...baseProfile, aboutMeFacts: "string" }).success,
    false,
  );
});

test("v0.7.1 outer schema integration — reproduces the Big Star DLQ payload and it VALIDATES", () => {
  const payload = {
    tenantId: "tenant_1774748302517_udvaiy",
    syncedAt: "2026-06-08T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: { ...AGENT_V6, roles: ["MLO"], licenses: { mlo: DUAL_LICENSES.mlo } },
    agentProfile: { ...baseProfile, aboutMeFacts: ABOUT_ME_FACTS_REAL },
  };
  assert.equal(AgentProvisioningPayloadSchema_v0_7_1.safeParse(payload).success, true);
});

test("CONTROL: the SAME Big Star payload was REJECTED by v0.7.0 (proves the bug + the fix)", () => {
  const payload = {
    tenantId: "tenant_1774748302517_udvaiy",
    syncedAt: "2026-06-08T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: { ...AGENT_V6, roles: ["MLO"], licenses: { mlo: DUAL_LICENSES.mlo } },
    agentProfile: { ...baseProfile, aboutMeFacts: ABOUT_ME_FACTS_REAL },
  };
  // v0.7.0 typed aboutMeFacts as a string → array is invalid_type → whole-payload reject.
  assert.equal(AgentProvisioningPayloadSchema_v0_7_0.safeParse(payload).success, false);
});

test("v0.7.1 projection KEEPS aboutMeFacts (known key in all versions; never stripped)", () => {
  const payload = {
    tenantId: "t_123",
    syncedAt: "2026-06-08T00:00:00.000Z",
    action: "update",
    physicalAddress: null,
    tenantBranding: { terminology: {}, teamRoleCopy: {} },
    agent: { ...AGENT_V6 },
    agentProfile: { ...baseProfile, aboutMeFacts: ABOUT_ME_FACTS_REAL },
  };
  // Even projecting to a laggard spoke, aboutMeFacts is a known key in every
  // version's shape, so projection passes the array through unchanged. The
  // failing gate was Rello's own pre-fan-out validate (latest schema), which
  // is why re-pinning Rello alone drains the DLQ for all spokes.
  for (const v of ["v0.3.0", "v0.4.0", "v0.6.0", "v0.7.0", "v0.7.1"]) {
    const { projected, omittedFields } = projectPayloadForVersion(payload, v);
    const ap = projected.agentProfile as Record<string, unknown>;
    assert.deepEqual(ap.aboutMeFacts, ABOUT_ME_FACTS_REAL, `aboutMeFacts kept for ${v}`);
    assert.equal(omittedFields.includes("agentProfile.aboutMeFacts"), false, `not stripped for ${v}`);
  }
});
