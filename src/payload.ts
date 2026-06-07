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
 *
 * v0.6.0 — adds `agent.relloUserId` (the owning Rello `User.id` / OIDC `sub`),
 * disambiguating the two cross-app identity spaces (`relloAgentId` = Agent.id
 * cuid vs `relloUserId` = User.id) that collided at the OHH events Bearer
 * seam. The `agent` block is now compositionally versioned (added to
 * `NESTED_KEYS`) so projection strips `relloUserId` for spokes pinned
 * < v0.6.0. Provenance: DISPATCH-T5D + DISCOVERED-PFP-OHH-RELLOAGENTID-
 * IDENTITY-CONTRACT-CONFLICT-260528.
 *
 * v0.7.0 — DUAL-LICENSE (MLO + RE) IDENTITY P3 (wire contract). Adds
 * `agent.roles` (free-text string[] dual signal, e.g. ["MLO","RE"]) and
 * `agent.licenses` ({ mlo?, re? } — one optional strict sub-object per
 * license type, mirroring the active rows of the Rello `AgentLicense`
 * canonical table). Both live INSIDE the already-versioned `agent` block, so
 * `projectPayloadForVersion` strips them whole for any spoke pinned < v0.7.0
 * (their `agent.shape` lacks the keys → `.strict()` receiver never 400s; the
 * laggard keeps the flat `agent.{nmlsNumber,licenseNumber,brokerage*}` mirror
 * the producer continues to populate). Provenance: SPEC-P3-WIRE-CONTRACT.md.
 *
 * VERSION-CORRECTION NOTE (BR-8 "canonical-latest = latest git TAG"): the
 * workstream feature/audit docs name this bump "v0.6.0 (additive licenses)" —
 * that is STALE. v0.6.0 was already shipped for `relloUserId` (a DIFFERENT
 * change). The dual-license additive bump is therefore **v0.7.0**.
 */

// ── v0.3.0 baseline agent block (frozen across v0.3.0 → v0.5.0 — the agent
//    object did not change across those releases). ─────────────────────────
//
// IDENTITY CONTRACT — `relloAgentId` is the Rello `Agent.id` (cuid). This is
// the cascade / provisioning / signals identity space (matched against the
// spoke `User.relloAgentId` column and the `agent.profile_updated` webhook).
// See `AgentPayloadSchema_v0_6_0` for the companion `relloUserId` (User.id /
// OIDC-sub space) added in v0.6.0.
export const AgentPayloadSchema_v0_3_0 = z.object({
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

// ── v0.6.0 — adds `relloUserId` via .extend(). ──────────────────────────────
//
// CANONICAL IDENTITY-SPACE CONTRACT (source of truth — DISPATCH-T5D, the
// `relloAgentId`-identity-contract resolution, 2026-05-28):
//
//   relloAgentId : Rello `Agent.id` (cuid). Used by cascade / provisioning /
//                  signals consumers operating on Agent-shaped entities
//                  (spoke `User.relloAgentId` mirror; `agent.profile_updated`
//                  webhook; `realtor-prospect-intake`).
//   relloUserId  : Rello `User.id` (`user_*`) — the owning login User, which
//                  is exactly the value Rello OIDC issues as the `sub` claim
//                  (Rello issues NO `agent_id` claim). Used by OIDC-sourced
//                  consumers — PFP cockpit (`AgentConfig.relloAgentId` is
//                  sourced from the OIDC sub = a User.id), spoke-session
//                  bearers, and the OHH events Bearer resolution. Matched
//                  against the spoke `User.relloUserId` column.
//
// OPTIONAL + NULLABLE — the durable identity contract is enforced at the
// PRODUCER, not by schema-requiredness:
//   - Rello's `push-agent.ts` ALWAYS populates `relloUserId` for v0.6.0 sends
//     (= `agent.userId`, the owning login User), so OHH always receives it.
//   - `nullable`: an Agent may have no login User (`Rello.Agent.userId
//     String? @unique`); login-less agents carry `null` and cannot originate
//     OIDC-sourced (User.id-keyed) calls anyway.
//   - `optional`: preserves the package's strict-additive CSA cadence (DL5) —
//     a pre-v0.6.0-shaped payload still parses under the latest schema (see
//     the "latest alias parses v0.4.0 payload" round-trip test), exactly as
//     every v0.4.0 PFP field is optional. A required field here would be a
//     back-compat break, not a strict-additive extension.
//   - `min(1)`: when present, the value must be non-empty (no `""` sentinel).
//
// Versioning the `agent` block (rather than extending the shared baseline) is
// load-bearing for CSA: `projectPayloadForVersion` (project-for-version.ts,
// `agent` ∈ NESTED_KEYS) strips `relloUserId` for any spoke pinned < v0.6.0,
// so that spoke's `.strict()` receiver never 400s on the novel field. This is
// the durable form of the v0.4.0 lesson (DISCOVERED-CSA-V040-STRICT-RECEIVER-
// REJECTS-9-SPOKES-WAVE-1B-FOLLOWUP-GAP-260519).
export const AgentPayloadSchema_v0_6_0 = AgentPayloadSchema_v0_3_0.extend({
  relloUserId: z.string().min(1).nullable().optional(),
}).strict();

// ── v0.7.0 — DUAL-LICENSE (MLO + RE): adds `roles` + `licenses`. ────────────
//
// SOURCE OF TRUTH: the active rows of the Rello `AgentLicense` canonical table
// (one row per (agent, type); SPEC-P0-DATA-MODEL §1.2). The wire mirrors the
// ACTIVE facets — one optional sub-object per license type.
//
//   roles    : free-text string[] — e.g. ["MLO"], ["RE"], ["MLO","RE"] for a
//              dual agent. Derived from the agent's ACTIVE AgentLicense rows.
//              The canonical dual signal. Additive + free-text = non-breaking
//              (the existing `role: z.string()` is also free-text). The
//              singular `role` stays for back-compat; `roles` is the additive
//              dual signal a v0.7.0+ receiver reads to detect a dual agent.
//
//   licenses : { mlo?, re? } — per-type identity. Each facet is `.strict()`
//              (package convention — an unknown sub-key surfaces at the
//              producer's own InnerPayloadSchema.safeParse, not silently
//              riding along) and `.optional()` (a single-hat agent omits the
//              other facet; a brand-new licenseless agent omits `licenses`).
//
// Field meanings (SPEC-P3 §1.2, P0 shared-column design — `type` disambiguates):
//   mlo.nmlsNumber  = AgentLicense(MLO).nmlsNumber   (agent NMLS #)
//   mlo.states      = AgentLicense(MLO).states       (loan-origination states)
//   mlo.firmName    = AgentLicense(MLO).firmName     (mortgage company)
//   mlo.firmLicense = AgentLicense(MLO).firmLicense  (company NMLS #)
//   mlo.firmLogoUrl = AgentLicense(MLO).firmLogoUrl  (mortgage-company logo)
//   re.licenseNumber= AgentLicense(RE).licenseNumber (state RE license #)
//   re.states       = AgentLicense(RE).states        (RE licensed states)
//   re.firmName     = AgentLicense(RE).firmName      (brokerage)
//   re.firmLicense  = AgentLicense(RE).firmLicense   (brokerage license #)
//   re.firmLogoUrl  = AgentLicense(RE).firmLogoUrl   (brokerage logo)
//
// PROJECTION: `roles`/`licenses` are NEW keys in the v0.7.0 `agent.shape`.
// Because `agent` ∈ NESTED_KEYS (project-for-version.ts) and the machine
// recurses EXACTLY one level, a spoke pinned < v0.7.0 has neither key in its
// projected `agent.shape` → BOTH are stripped WHOLE (the `{mlo,re}` inner
// structure is NOT independently projected — it rides or strips as one unit).
// The laggard then keeps only the flat mirror (`agent.nmlsNumber`,
// `licenseNumber`, `brokerage*`) the producer continues to populate.
export const AgentPayloadSchema_v0_7_0 = AgentPayloadSchema_v0_6_0.extend({
  roles: z.array(z.string()).optional(),
  licenses: z.object({
    mlo: z.object({
      nmlsNumber: z.string().optional(),
      states: z.array(z.string()),
      firmName: z.string().optional(),
      firmLicense: z.string().optional(),
      firmLogoUrl: z.string().optional(),
    }).strict().optional(),
    re: z.object({
      licenseNumber: z.string().optional(),
      states: z.array(z.string()),
      firmName: z.string().optional(),
      firmLicense: z.string().optional(),
      firmLogoUrl: z.string().optional(),
    }).strict().optional(),
  }).strict().optional(),
}).strict();

// "Latest" alias points to newest compositional export.
export const AgentPayloadSchema = AgentPayloadSchema_v0_7_0;

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
  agent: AgentPayloadSchema_v0_3_0,
  agentProfile: AgentProfilePayloadSchema_v0_3_0.optional(),
  wizardAnswers: z.array(WizardAnswerPayloadSchema).optional(),
  agentNotificationPreference: AgentNotificationPreferencePayloadSchema.nullable().optional(),
}).strict();

// ── v0.4.0 — swaps AgentProfile_v0_3_0 for AgentProfile_v0_4_0. ─────────────
export const AgentProvisioningPayloadSchema_v0_4_0 = AgentProvisioningPayloadSchema_v0_3_0.extend({
  agentProfile: AgentProfilePayloadSchema_v0_4_0.optional(),
}).strict();

// ── v0.6.0 — swaps the agent block for AgentPayloadSchema_v0_6_0 (adds
//    `relloUserId`). agentProfile stays at v0.4.0. ─────────────────────────
// (v0.5.0 was infra-only — compositional exports + projectPayloadForVersion —
// with NO payload-shape change, so the next shape change is v0.6.0.)
export const AgentProvisioningPayloadSchema_v0_6_0 = AgentProvisioningPayloadSchema_v0_4_0.extend({
  agent: AgentPayloadSchema_v0_6_0,
}).strict();

// ── v0.7.0 — swaps the agent block for AgentPayloadSchema_v0_7_0 (adds
//    `roles` + `licenses`). agentProfile stays at v0.4.0. ───────────────────
export const AgentProvisioningPayloadSchema_v0_7_0 = AgentProvisioningPayloadSchema_v0_6_0.extend({
  agent: AgentPayloadSchema_v0_7_0,
}).strict();

// "Latest" alias points to newest compositional export. Preserved for
// backward-compatible imports per Build Plan Phase 1 step 2.
export const AgentProvisioningPayloadSchema = AgentProvisioningPayloadSchema_v0_7_0;

// Codified fallback for unprobed spokes (DL6).
export const BASELINE_SCHEMA_VERSION = "v0.3.0" as const;

// Heartbeat response value — the schema version this PACKAGE ships (DL1).
// Bumped at each release alongside `package.json` version.
export const PACKAGE_SCHEMA_VERSION = "v0.7.0" as const;

// Version registry — maps semver string → schema object. Consumed by
// projectPayloadForVersion. Add new versions here as they ship.
export const VERSIONED_SCHEMAS = {
  "v0.3.0": AgentProvisioningPayloadSchema_v0_3_0,
  "v0.4.0": AgentProvisioningPayloadSchema_v0_4_0,
  // v0.5.0 was an infra-only release (compositional versioned exports +
  // projectPayloadForVersion) — its payload SHAPE is identical to v0.4.0.
  // Registering it here maps a v0.5.0-pinned spoke to the correct schema
  // instead of silently falling back to BASELINE_SCHEMA_VERSION (v0.3.0),
  // which would wrongly strip the v0.4.0 PFP MLO fields from that spoke's
  // projected payload. (Latent gap before T5D — no spoke had reached v0.5.0
  // except those probed pre-fix; registered for correctness.)
  "v0.5.0": AgentProvisioningPayloadSchema_v0_4_0,
  "v0.6.0": AgentProvisioningPayloadSchema_v0_6_0,
  "v0.7.0": AgentProvisioningPayloadSchema_v0_7_0,
} as const;

export type SupportedSchemaVersion = keyof typeof VERSIONED_SCHEMAS;

export type AgentProvisioningPayload = z.infer<typeof AgentProvisioningPayloadSchema>;
export type AgentPayload = z.infer<typeof AgentPayloadSchema>;
export type AgentProfilePayload = z.infer<typeof AgentProfilePayloadSchema>;
export type TenantBrandingPayload = z.infer<typeof TenantBrandingPayloadSchema>;
export type WizardAnswerPayload = z.infer<typeof WizardAnswerPayloadSchema>;
export type AgentNotificationPreferencePayload = z.infer<typeof AgentNotificationPreferencePayloadSchema>;
