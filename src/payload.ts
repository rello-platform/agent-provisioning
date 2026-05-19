import { z } from "zod";

// PFP MLO Mini-Wizard enum sets — verbatim from
// ~/Rello/src/app/api/v1/agent-profile/route.ts:34-36 @ SHA 202fbbfe.
// Source of truth lives at the Rello PATCH validator; mirrored here so the
// canonical schema rejects out-of-set values at the spoke receiver's safeParse.
const LOAN_PROGRAMS = ["CONV", "FHA", "VA", "USDA", "JUMBO", "NONQM"] as const;
const EQUAL_HOUSING_PLACEMENTS = ["header", "footer", "both", "none"] as const;
const CREDIT_PULL_PREFERENCES = ["soft", "hard", "borrower_choice"] as const;

/**
 * Canonical zod schema for the Rello → spokes cascade payload.
 *
 * Source of truth: extracted verbatim from
 * `~/Rello/src/lib/provisioning/push-agent.ts:155-220` `agentPayload`
 * literal at origin/main SHA 4b8c1e2b04b7a8577cd58a38772752db9c7bfecb.
 *
 * Breaking change from pre-cascade-adoption shape:
 *   - Top-level `relloTenantId` removed; `tenantId` is injected by
 *     `@rello-platform/cascade::pushToSpokes` at the body root.
 *
 * All schemas are `.strict()` — unknown fields surface as 400 at the
 * spoke receiver (per `mirrorReceiver`'s `safeParse`). This closes the
 * D-7 (NS dropped tenantBranding) / D-8 (HS asymmetric writer) /
 * D-9 (HS physicalAddress Json) drift class.
 *
 * v0.5.0 — compositional versioned exports per CSA Wave-1E (DL4 +
 * DL5 strict-additive cadence). Each released payload version ships
 * a named export `*PayloadSchema_v0_N_0` composed via `.extend()`
 * from the previous version. `projectPayloadForVersion` (see
 * ./project-for-version.ts) uses `.shape` introspection on these
 * versioned schemas to strip fields the target spoke's pinned
 * version does not declare.
 */

export const AgentPayloadSchema = z.object({
  relloAgentId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  slug: z.string().min(1),
  role: z.string().min(1),
  phone: z.string().nullable(),
  photoUrl: z.string().optional(),
  bio: z.string().optional(),
  title: z.string().optional(),
  tagline: z.string().optional(),
  brokerageName: z.string().optional(),
  brokerageLogoUrl: z.string().optional(),
  brokerageLicenseNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  nmlsNumber: z.string().optional(),
  websiteUrl: z.string().optional(),
  applicationUrl: z.string().optional(),
  social: z.unknown().optional(),
  mloName: z.string().optional(),
  mloNmls: z.string().optional(),

  // Per Rello-canonical home (Rello.Agent.emailSignature) — D-5 resolution
  // (build doc § 6 + Example 3). NS-side spoke-canonical legacy column
  // retired in D-5.C-NS dispatch.
  emailSignature: z.string().nullable().optional(),
}).strict();

// ── v0.3.0 baseline — pre-PFP MLO fields (frozen). ──────────────────────────
export const AgentProfilePayloadSchema_v0_3_0 = z.object({
  specialtySentence: z.string().optional(),
  experienceStatement: z.string().optional(),
  typicalClient: z.array(z.string()),
  areasServed: z.array(z.string()),
  designations: z.array(z.string()),
  emailTone: z.string().optional(),
  soloOrTeam: z.string().optional(),
  preferredContactMethod: z.string().optional(),
  calendarLink: z.string().optional(),
  aboutMeFacts: z.string().optional(),
  avoidTopics: z.array(z.string()),
  emphasizeTopics: z.array(z.string()),
  sensitiveTopics: z.array(z.string()),
  introductionDraft: z.string().optional(),
  signoffStyle: z.string().optional(),
  successStorySeeds: z.unknown().optional(),
  sendFrequency: z.string().optional(),
  newsletterTemplateId: z.string().optional(),
  brandColors: z.unknown().optional(),
  leadSourceContext: z.string().optional(),
}).strict();

// ── v0.4.0 — adds 7 PFP MLO Mini-Wizard fields via .extend(). ───────────────
// Canonical home: ~/Rello/prisma/schema.prisma:10300-10306 @ SHA 202fbbfe.
// Validator mirrored from ~/Rello/src/app/api/v1/agent-profile/route.ts:119-125.
// Read by PFP Mini-Wizard Step 2, SPEC-PFP-MILO-LETTER-COMPOSITION,
// SPEC-PFP-MLO-COMPLIANCE-GATES via push-agent.ts → spoke receiver.
export const AgentProfilePayloadSchema_v0_4_0 = AgentProfilePayloadSchema_v0_3_0.extend({
  licensedStates: z.array(z.string().length(2).regex(/^[A-Z]{2}$/)).optional(),
  pfpDefaultLender: z.string().max(200).optional().nullable(),
  pfpDefaultLoanPrograms: z.array(z.enum(LOAN_PROGRAMS)).optional(),
  pfpDefaultRateSource: z.string().max(100).optional().nullable(),
  pfpEqualHousingLogoPlacement: z.enum(EQUAL_HOUSING_PLACEMENTS).optional().nullable(),
  pfpDefaultCreditPullPreference: z.enum(CREDIT_PULL_PREFERENCES).optional().nullable(),
  pfpWizardCompletedAt: z.coerce.date().optional().nullable(),
}).strict();

// "Latest" alias points to newest compositional export. Preserved for
// backward-compatible imports per Build Plan Phase 1 step 2.
export const AgentProfilePayloadSchema = AgentProfilePayloadSchema_v0_4_0;

export const TenantBrandingPayloadSchema = z.object({
  terminology: z.record(z.string(), z.unknown()),
  teamRoleCopy: z.record(z.string(), z.unknown()),
}).strict();

export const WizardAnswerPayloadSchema = z.object({
  questionId: z.string().min(1),
  question: z.string(),
  answer: z.unknown(),
}).strict();

/**
 * Canonical zod schema for per-Agent notification preferences cascaded
 * from Rello to dispatching spokes. Resolves D-14 (per-tenant notification
 * preferences spoke-by-spoke divergence) per build doc § 8 Q5 + Q9 + Q10
 * locks (Walk 2 2026-05-11).
 *
 * Master toggles (cross-spoke reach):
 *   - notifyByEmail, notifyBySms, notifyByPush
 *
 * Per-spoke cadence (digest controls):
 *   - dailyDigest, weeklyAnalytics
 *
 * Defaults are application-side (Prisma @default) — Conservative per Example
 * 6 in ~CASCADING-GUARDRAILS-AND-SETTINGS-README.md §11: notify-on-everything
 * for first interaction class, opt-in for subsequent.
 *
 * Per-event toggles (leadAlerts, eventInvites, newsletterDigest,
 * mortgageUpdates, marketAlerts, videoDrops, engagementSummary,
 * escalationAlerts) DEFERRED to v0.2.x as per-spoke active-dispatch wiring
 * specs need them (Q10 lock — per-spoke wiring is per-spoke Phase 1 KA
 * territory, not this dispatch).
 */
export const AgentNotificationPreferencePayloadSchema = z.object({
  notifyByEmail: z.boolean(),
  notifyBySms: z.boolean(),
  notifyByPush: z.boolean(),
  dailyDigest: z.boolean(),
  weeklyAnalytics: z.boolean(),
}).strict();

// ── v0.3.0 baseline — outer schema with v0.3.0 AgentProfile. ────────────────
export const AgentProvisioningPayloadSchema_v0_3_0 = z.object({
  // tenantId is injected at root by @rello-platform/cascade::pushToSpokes
  // syncedAt is injected at root by @rello-platform/cascade::pushToSpokes
  // force is injected at root by @rello-platform/cascade::pushToSpokes (optional)
  tenantId: z.string().min(1),
  syncedAt: z.string().datetime(),
  force: z.literal(true).optional(),

  action: z.enum(["add", "remove", "update"]),
  physicalAddress: z.string().nullable(),
  tenantBranding: TenantBrandingPayloadSchema,
  agent: AgentPayloadSchema,
  agentProfile: AgentProfilePayloadSchema_v0_3_0.optional(),
  wizardAnswers: z.array(WizardAnswerPayloadSchema).optional(),
  agentNotificationPreference: AgentNotificationPreferencePayloadSchema.nullable().optional(),
}).strict();

// ── v0.4.0 — swaps AgentProfile_v0_3_0 for AgentProfile_v0_4_0. ─────────────
export const AgentProvisioningPayloadSchema_v0_4_0 = AgentProvisioningPayloadSchema_v0_3_0.extend({
  agentProfile: AgentProfilePayloadSchema_v0_4_0.optional(),
}).strict();

// "Latest" alias points to newest compositional export. Preserved for
// backward-compatible imports per Build Plan Phase 1 step 2.
export const AgentProvisioningPayloadSchema = AgentProvisioningPayloadSchema_v0_4_0;

// Codified fallback for unprobed spokes (DL6).
export const BASELINE_SCHEMA_VERSION = "v0.3.0" as const;

// Heartbeat response value — the schema version this PACKAGE ships (DL1).
// Bumped at each release alongside `package.json` version.
export const PACKAGE_SCHEMA_VERSION = "v0.5.0" as const;

// Version registry — maps semver string → schema object. Consumed by
// projectPayloadForVersion. Add new versions here as they ship.
export const VERSIONED_SCHEMAS = {
  "v0.3.0": AgentProvisioningPayloadSchema_v0_3_0,
  "v0.4.0": AgentProvisioningPayloadSchema_v0_4_0,
} as const;

export type SupportedSchemaVersion = keyof typeof VERSIONED_SCHEMAS;

export type AgentProvisioningPayload = z.infer<typeof AgentProvisioningPayloadSchema>;
export type AgentPayload = z.infer<typeof AgentPayloadSchema>;
export type AgentProfilePayload = z.infer<typeof AgentProfilePayloadSchema>;
export type TenantBrandingPayload = z.infer<typeof TenantBrandingPayloadSchema>;
export type WizardAnswerPayload = z.infer<typeof WizardAnswerPayloadSchema>;
export type AgentNotificationPreferencePayload = z.infer<typeof AgentNotificationPreferencePayloadSchema>;
