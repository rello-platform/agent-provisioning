import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AgentProvisioningPayloadSchema,
  AgentProvisioningPayloadSchema_v0_3_0,
  AgentProvisioningPayloadSchema_v0_4_0,
  AgentProfilePayloadSchema_v0_3_0,
  AgentProfilePayloadSchema_v0_4_0,
  BASELINE_SCHEMA_VERSION,
  PACKAGE_SCHEMA_VERSION,
  VERSIONED_SCHEMAS,
  projectPayloadForVersion,
  schemaVersionHandler,
} from "./index.js";

// ── Constants ───────────────────────────────────────────────────────────────

test("BASELINE_SCHEMA_VERSION is v0.3.0 (DL6)", () => {
  assert.equal(BASELINE_SCHEMA_VERSION, "v0.3.0");
});

test("PACKAGE_SCHEMA_VERSION is v0.5.0 (DL1)", () => {
  assert.equal(PACKAGE_SCHEMA_VERSION, "v0.5.0");
});

test("VERSIONED_SCHEMAS registry includes v0.3.0 and v0.4.0", () => {
  assert.equal("v0.3.0" in VERSIONED_SCHEMAS, true);
  assert.equal("v0.4.0" in VERSIONED_SCHEMAS, true);
});

// ── Baseline-schema-rejects-novel-fields sanity (drift #3 (i)) ──────────────

test("AgentProfilePayloadSchema_v0_3_0 (strict) rejects v0.4.0 PFP MLO key licensedStates", () => {
  const profile = {
    typicalClient: [], areasServed: [], designations: [],
    avoidTopics: [], emphasizeTopics: [], sensitiveTopics: [],
    licensedStates: ["UT"], // novel v0.4.0 field
  };
  assert.equal(AgentProfilePayloadSchema_v0_3_0.safeParse(profile).success, false);
});

test("AgentProfilePayloadSchema_v0_3_0 (strict) rejects v0.4.0 PFP MLO key pfpDefaultLender", () => {
  const profile = {
    typicalClient: [], areasServed: [], designations: [],
    avoidTopics: [], emphasizeTopics: [], sensitiveTopics: [],
    pfpDefaultLender: "Big Star Mortgage",
  };
  assert.equal(AgentProfilePayloadSchema_v0_3_0.safeParse(profile).success, false);
});

test("AgentProfilePayloadSchema_v0_4_0 accepts all 7 PFP MLO fields (drift #3 (ii))", () => {
  const profile = {
    typicalClient: [], areasServed: [], designations: [],
    avoidTopics: [], emphasizeTopics: [], sensitiveTopics: [],
    licensedStates: ["UT", "ID"],
    pfpDefaultLender: "Big Star Mortgage",
    pfpDefaultLoanPrograms: ["CONV"],
    pfpDefaultRateSource: "MND Daily",
    pfpEqualHousingLogoPlacement: "footer",
    pfpDefaultCreditPullPreference: "soft",
    pfpWizardCompletedAt: "2026-05-19T00:00:00.000Z",
  };
  assert.equal(AgentProfilePayloadSchema_v0_4_0.safeParse(profile).success, true);
});

// ── projectPayloadForVersion — DL4 omit-logic ───────────────────────────────

const v0_4_0_payload = {
  tenantId: "t_123",
  syncedAt: "2026-05-19T00:00:00.000Z",
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
  agentProfile: {
    typicalClient: [], areasServed: [], designations: [],
    avoidTopics: [], emphasizeTopics: [], sensitiveTopics: [],
    // 7 PFP MLO fields (novel at v0.4.0):
    licensedStates: ["UT"],
    pfpDefaultLender: "Big Star",
    pfpDefaultLoanPrograms: ["CONV"],
    pfpDefaultRateSource: "MND Daily",
    pfpEqualHousingLogoPlacement: "footer",
    pfpDefaultCreditPullPreference: "soft",
    pfpWizardCompletedAt: "2026-05-19T00:00:00.000Z",
  },
};

const PFP_MLO_FIELDS = [
  "licensedStates",
  "pfpDefaultLender",
  "pfpDefaultLoanPrograms",
  "pfpDefaultRateSource",
  "pfpEqualHousingLogoPlacement",
  "pfpDefaultCreditPullPreference",
  "pfpWizardCompletedAt",
];

test("projectPayloadForVersion(v0.4.0 payload, 'v0.3.0') strips all 7 PFP MLO fields (drift #3 (iii))", () => {
  const result = projectPayloadForVersion(v0_4_0_payload, "v0.3.0");
  assert.equal(result.resolvedVersion, "v0.3.0");
  // omittedFields should contain all 7 PFP MLO fields prefixed with "agentProfile."
  for (const field of PFP_MLO_FIELDS) {
    assert.equal(
      result.omittedFields.includes(`agentProfile.${field}`),
      true,
      `omittedFields missing agentProfile.${field}`,
    );
  }
});

test("projectPayloadForVersion(v0.4.0 payload, 'v0.3.0') projection parses cleanly under _v0_3_0 (drift #3 (iii))", () => {
  const result = projectPayloadForVersion(v0_4_0_payload, "v0.3.0");
  const parsed = AgentProvisioningPayloadSchema_v0_3_0.safeParse(result.projected);
  assert.equal(parsed.success, true);
});

test("projectPayloadForVersion(v0.4.0 payload, 'v0.4.0') is passthrough (drift #3 (iv))", () => {
  const result = projectPayloadForVersion(v0_4_0_payload, "v0.4.0");
  assert.equal(result.resolvedVersion, "v0.4.0");
  assert.equal(result.omittedFields.length, 0);
  // Projection should round-trip parse cleanly under v0.4.0
  const parsed = AgentProvisioningPayloadSchema_v0_4_0.safeParse(result.projected);
  assert.equal(parsed.success, true);
});

test("projectPayloadForVersion(payload, null) resolves to BASELINE_SCHEMA_VERSION", () => {
  const result = projectPayloadForVersion(v0_4_0_payload, null);
  assert.equal(result.resolvedVersion, "v0.3.0");
});

test("projectPayloadForVersion(payload, undefined) resolves to BASELINE_SCHEMA_VERSION", () => {
  const result = projectPayloadForVersion(v0_4_0_payload, undefined);
  assert.equal(result.resolvedVersion, "v0.3.0");
});

test("projectPayloadForVersion(payload, 'v999.0.0') (unknown) resolves to BASELINE_SCHEMA_VERSION", () => {
  const result = projectPayloadForVersion(v0_4_0_payload, "v999.0.0");
  assert.equal(result.resolvedVersion, "v0.3.0");
});

test("projectPayloadForVersion strips unknown root-level keys", () => {
  const payload = { ...v0_4_0_payload, completelyUnknownTopLevelKey: "drift" };
  const result = projectPayloadForVersion(payload, "v0.4.0");
  assert.equal(result.omittedFields.includes("completelyUnknownTopLevelKey"), true);
});

test("Round-trip: AgentProvisioningPayloadSchema (latest alias) parses v0.4.0 payload", () => {
  assert.equal(AgentProvisioningPayloadSchema.safeParse(v0_4_0_payload).success, true);
});

// ── schemaVersionHandler — DL1 heartbeat handler ────────────────────────────

test("schemaVersionHandler returns 200 with { schemaVersion: 'v0.5.0' }", async () => {
  const req = new Request("https://example.com/api/provisioning/schema-version");
  const res = await schemaVersionHandler(req);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Content-Type"), "application/json");
  assert.equal(res.headers.get("Cache-Control"), "no-store");
  const body = await res.json() as { schemaVersion: string };
  assert.equal(body.schemaVersion, "v0.5.0");
});
