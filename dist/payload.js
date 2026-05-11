import { z } from "zod";
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
export const AgentProfilePayloadSchema = z.object({
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
export const AgentProvisioningPayloadSchema = z.object({
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
    agentProfile: AgentProfilePayloadSchema.optional(),
    wizardAnswers: z.array(WizardAnswerPayloadSchema).optional(),
    agentNotificationPreference: AgentNotificationPreferencePayloadSchema.nullable().optional(),
}).strict();
//# sourceMappingURL=payload.js.map