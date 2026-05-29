import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AgentProvisioningPayloadSchema,
  AgentProvisioningPayloadSchema_v0_3_0,
  AgentProvisioningPayloadSchema_v0_6_0,
  AgentPayloadSchema,
  AgentPayloadSchema_v0_3_0,
  AgentPayloadSchema_v0_6_0,
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

test("PACKAGE_SCHEMA_VERSION is v0.6.0", () => {
  assert.equal(PACKAGE_SCHEMA_VERSION, "v0.6.0");
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
