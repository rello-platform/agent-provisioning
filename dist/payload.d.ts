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
export declare const AgentPayloadSchema_v0_3_0: z.ZodObject<{
    relloAgentId: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    slug: z.ZodString;
    role: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    tagline: z.ZodOptional<z.ZodString>;
    brokerageName: z.ZodOptional<z.ZodString>;
    brokerageLogoUrl: z.ZodOptional<z.ZodString>;
    brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    licenseState: z.ZodOptional<z.ZodString>;
    nmlsNumber: z.ZodOptional<z.ZodString>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    applicationUrl: z.ZodOptional<z.ZodString>;
    social: z.ZodOptional<z.ZodUnknown>;
    mloName: z.ZodOptional<z.ZodString>;
    mloNmls: z.ZodOptional<z.ZodString>;
    emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export declare const AgentPayloadSchema_v0_6_0: z.ZodObject<{
    relloAgentId: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    slug: z.ZodString;
    role: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    tagline: z.ZodOptional<z.ZodString>;
    brokerageName: z.ZodOptional<z.ZodString>;
    brokerageLogoUrl: z.ZodOptional<z.ZodString>;
    brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    licenseState: z.ZodOptional<z.ZodString>;
    nmlsNumber: z.ZodOptional<z.ZodString>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    applicationUrl: z.ZodOptional<z.ZodString>;
    social: z.ZodOptional<z.ZodUnknown>;
    mloName: z.ZodOptional<z.ZodString>;
    mloNmls: z.ZodOptional<z.ZodString>;
    emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    relloUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export declare const AgentPayloadSchema_v0_7_0: z.ZodObject<{
    relloAgentId: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    slug: z.ZodString;
    role: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    tagline: z.ZodOptional<z.ZodString>;
    brokerageName: z.ZodOptional<z.ZodString>;
    brokerageLogoUrl: z.ZodOptional<z.ZodString>;
    brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    licenseState: z.ZodOptional<z.ZodString>;
    nmlsNumber: z.ZodOptional<z.ZodString>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    applicationUrl: z.ZodOptional<z.ZodString>;
    social: z.ZodOptional<z.ZodUnknown>;
    mloName: z.ZodOptional<z.ZodString>;
    mloNmls: z.ZodOptional<z.ZodString>;
    emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    relloUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    roles: z.ZodOptional<z.ZodArray<z.ZodString>>;
    licenses: z.ZodOptional<z.ZodObject<{
        mlo: z.ZodOptional<z.ZodObject<{
            nmlsNumber: z.ZodOptional<z.ZodString>;
            states: z.ZodArray<z.ZodString>;
            firmName: z.ZodOptional<z.ZodString>;
            firmLicense: z.ZodOptional<z.ZodString>;
            firmLogoUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        re: z.ZodOptional<z.ZodObject<{
            licenseNumber: z.ZodOptional<z.ZodString>;
            states: z.ZodArray<z.ZodString>;
            firmName: z.ZodOptional<z.ZodString>;
            firmLicense: z.ZodOptional<z.ZodString>;
            firmLogoUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const AgentPayloadSchema: z.ZodObject<{
    relloAgentId: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    slug: z.ZodString;
    role: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    tagline: z.ZodOptional<z.ZodString>;
    brokerageName: z.ZodOptional<z.ZodString>;
    brokerageLogoUrl: z.ZodOptional<z.ZodString>;
    brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    licenseState: z.ZodOptional<z.ZodString>;
    nmlsNumber: z.ZodOptional<z.ZodString>;
    websiteUrl: z.ZodOptional<z.ZodString>;
    applicationUrl: z.ZodOptional<z.ZodString>;
    social: z.ZodOptional<z.ZodUnknown>;
    mloName: z.ZodOptional<z.ZodString>;
    mloNmls: z.ZodOptional<z.ZodString>;
    emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    relloUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    roles: z.ZodOptional<z.ZodArray<z.ZodString>>;
    licenses: z.ZodOptional<z.ZodObject<{
        mlo: z.ZodOptional<z.ZodObject<{
            nmlsNumber: z.ZodOptional<z.ZodString>;
            states: z.ZodArray<z.ZodString>;
            firmName: z.ZodOptional<z.ZodString>;
            firmLicense: z.ZodOptional<z.ZodString>;
            firmLogoUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        re: z.ZodOptional<z.ZodObject<{
            licenseNumber: z.ZodOptional<z.ZodString>;
            states: z.ZodArray<z.ZodString>;
            firmName: z.ZodOptional<z.ZodString>;
            firmLicense: z.ZodOptional<z.ZodString>;
            firmLogoUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const AgentProfilePayloadSchema_v0_3_0: z.ZodObject<{
    specialtySentence: z.ZodOptional<z.ZodString>;
    experienceStatement: z.ZodOptional<z.ZodString>;
    typicalClient: z.ZodArray<z.ZodString>;
    areasServed: z.ZodArray<z.ZodString>;
    designations: z.ZodArray<z.ZodString>;
    emailTone: z.ZodOptional<z.ZodString>;
    soloOrTeam: z.ZodOptional<z.ZodString>;
    preferredContactMethod: z.ZodOptional<z.ZodString>;
    calendarLink: z.ZodOptional<z.ZodString>;
    aboutMeFacts: z.ZodOptional<z.ZodString>;
    avoidTopics: z.ZodArray<z.ZodString>;
    emphasizeTopics: z.ZodArray<z.ZodString>;
    sensitiveTopics: z.ZodArray<z.ZodString>;
    introductionDraft: z.ZodOptional<z.ZodString>;
    signoffStyle: z.ZodOptional<z.ZodString>;
    successStorySeeds: z.ZodOptional<z.ZodUnknown>;
    sendFrequency: z.ZodOptional<z.ZodString>;
    newsletterTemplateId: z.ZodOptional<z.ZodString>;
    brandColors: z.ZodOptional<z.ZodUnknown>;
    leadSourceContext: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const AgentProfilePayloadSchema_v0_4_0: z.ZodObject<{
    specialtySentence: z.ZodOptional<z.ZodString>;
    experienceStatement: z.ZodOptional<z.ZodString>;
    typicalClient: z.ZodArray<z.ZodString>;
    areasServed: z.ZodArray<z.ZodString>;
    designations: z.ZodArray<z.ZodString>;
    emailTone: z.ZodOptional<z.ZodString>;
    soloOrTeam: z.ZodOptional<z.ZodString>;
    preferredContactMethod: z.ZodOptional<z.ZodString>;
    calendarLink: z.ZodOptional<z.ZodString>;
    aboutMeFacts: z.ZodOptional<z.ZodString>;
    avoidTopics: z.ZodArray<z.ZodString>;
    emphasizeTopics: z.ZodArray<z.ZodString>;
    sensitiveTopics: z.ZodArray<z.ZodString>;
    introductionDraft: z.ZodOptional<z.ZodString>;
    signoffStyle: z.ZodOptional<z.ZodString>;
    successStorySeeds: z.ZodOptional<z.ZodUnknown>;
    sendFrequency: z.ZodOptional<z.ZodString>;
    newsletterTemplateId: z.ZodOptional<z.ZodString>;
    brandColors: z.ZodOptional<z.ZodUnknown>;
    leadSourceContext: z.ZodOptional<z.ZodString>;
    licensedStates: z.ZodOptional<z.ZodArray<z.ZodString>>;
    pfpDefaultLender: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    pfpDefaultLoanPrograms: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        CONV: "CONV";
        FHA: "FHA";
        VA: "VA";
        USDA: "USDA";
        JUMBO: "JUMBO";
        NONQM: "NONQM";
    }>>>;
    pfpDefaultRateSource: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    pfpEqualHousingLogoPlacement: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
        header: "header";
        footer: "footer";
        both: "both";
        none: "none";
    }>>>;
    pfpDefaultCreditPullPreference: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
        soft: "soft";
        hard: "hard";
        borrower_choice: "borrower_choice";
    }>>>;
    pfpWizardCompletedAt: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
}, z.core.$strict>;
export declare const AgentProfilePayloadSchema: z.ZodObject<{
    specialtySentence: z.ZodOptional<z.ZodString>;
    experienceStatement: z.ZodOptional<z.ZodString>;
    typicalClient: z.ZodArray<z.ZodString>;
    areasServed: z.ZodArray<z.ZodString>;
    designations: z.ZodArray<z.ZodString>;
    emailTone: z.ZodOptional<z.ZodString>;
    soloOrTeam: z.ZodOptional<z.ZodString>;
    preferredContactMethod: z.ZodOptional<z.ZodString>;
    calendarLink: z.ZodOptional<z.ZodString>;
    aboutMeFacts: z.ZodOptional<z.ZodString>;
    avoidTopics: z.ZodArray<z.ZodString>;
    emphasizeTopics: z.ZodArray<z.ZodString>;
    sensitiveTopics: z.ZodArray<z.ZodString>;
    introductionDraft: z.ZodOptional<z.ZodString>;
    signoffStyle: z.ZodOptional<z.ZodString>;
    successStorySeeds: z.ZodOptional<z.ZodUnknown>;
    sendFrequency: z.ZodOptional<z.ZodString>;
    newsletterTemplateId: z.ZodOptional<z.ZodString>;
    brandColors: z.ZodOptional<z.ZodUnknown>;
    leadSourceContext: z.ZodOptional<z.ZodString>;
    licensedStates: z.ZodOptional<z.ZodArray<z.ZodString>>;
    pfpDefaultLender: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    pfpDefaultLoanPrograms: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        CONV: "CONV";
        FHA: "FHA";
        VA: "VA";
        USDA: "USDA";
        JUMBO: "JUMBO";
        NONQM: "NONQM";
    }>>>;
    pfpDefaultRateSource: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    pfpEqualHousingLogoPlacement: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
        header: "header";
        footer: "footer";
        both: "both";
        none: "none";
    }>>>;
    pfpDefaultCreditPullPreference: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
        soft: "soft";
        hard: "hard";
        borrower_choice: "borrower_choice";
    }>>>;
    pfpWizardCompletedAt: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
}, z.core.$strict>;
export declare const TenantBrandingPayloadSchema: z.ZodObject<{
    terminology: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    teamRoleCopy: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strict>;
export declare const WizardAnswerPayloadSchema: z.ZodObject<{
    questionId: z.ZodString;
    question: z.ZodString;
    answer: z.ZodUnknown;
}, z.core.$strict>;
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
export declare const AgentNotificationPreferencePayloadSchema: z.ZodObject<{
    notifyByEmail: z.ZodBoolean;
    notifyBySms: z.ZodBoolean;
    notifyByPush: z.ZodBoolean;
    dailyDigest: z.ZodBoolean;
    weeklyAnalytics: z.ZodBoolean;
}, z.core.$strict>;
export declare const AgentProvisioningPayloadSchema_v0_3_0: z.ZodObject<{
    tenantId: z.ZodString;
    syncedAt: z.ZodString;
    force: z.ZodOptional<z.ZodLiteral<true>>;
    action: z.ZodEnum<{
        add: "add";
        remove: "remove";
        update: "update";
    }>;
    physicalAddress: z.ZodNullable<z.ZodString>;
    tenantBranding: z.ZodObject<{
        terminology: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        teamRoleCopy: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>;
    agent: z.ZodObject<{
        relloAgentId: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        slug: z.ZodString;
        role: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        photoUrl: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        tagline: z.ZodOptional<z.ZodString>;
        brokerageName: z.ZodOptional<z.ZodString>;
        brokerageLogoUrl: z.ZodOptional<z.ZodString>;
        brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
        licenseNumber: z.ZodOptional<z.ZodString>;
        licenseState: z.ZodOptional<z.ZodString>;
        nmlsNumber: z.ZodOptional<z.ZodString>;
        websiteUrl: z.ZodOptional<z.ZodString>;
        applicationUrl: z.ZodOptional<z.ZodString>;
        social: z.ZodOptional<z.ZodUnknown>;
        mloName: z.ZodOptional<z.ZodString>;
        mloNmls: z.ZodOptional<z.ZodString>;
        emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    agentProfile: z.ZodOptional<z.ZodObject<{
        specialtySentence: z.ZodOptional<z.ZodString>;
        experienceStatement: z.ZodOptional<z.ZodString>;
        typicalClient: z.ZodArray<z.ZodString>;
        areasServed: z.ZodArray<z.ZodString>;
        designations: z.ZodArray<z.ZodString>;
        emailTone: z.ZodOptional<z.ZodString>;
        soloOrTeam: z.ZodOptional<z.ZodString>;
        preferredContactMethod: z.ZodOptional<z.ZodString>;
        calendarLink: z.ZodOptional<z.ZodString>;
        aboutMeFacts: z.ZodOptional<z.ZodString>;
        avoidTopics: z.ZodArray<z.ZodString>;
        emphasizeTopics: z.ZodArray<z.ZodString>;
        sensitiveTopics: z.ZodArray<z.ZodString>;
        introductionDraft: z.ZodOptional<z.ZodString>;
        signoffStyle: z.ZodOptional<z.ZodString>;
        successStorySeeds: z.ZodOptional<z.ZodUnknown>;
        sendFrequency: z.ZodOptional<z.ZodString>;
        newsletterTemplateId: z.ZodOptional<z.ZodString>;
        brandColors: z.ZodOptional<z.ZodUnknown>;
        leadSourceContext: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    wizardAnswers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        question: z.ZodString;
        answer: z.ZodUnknown;
    }, z.core.$strict>>>;
    agentNotificationPreference: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        notifyByEmail: z.ZodBoolean;
        notifyBySms: z.ZodBoolean;
        notifyByPush: z.ZodBoolean;
        dailyDigest: z.ZodBoolean;
        weeklyAnalytics: z.ZodBoolean;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export declare const AgentProvisioningPayloadSchema_v0_4_0: z.ZodObject<{
    tenantId: z.ZodString;
    syncedAt: z.ZodString;
    force: z.ZodOptional<z.ZodLiteral<true>>;
    action: z.ZodEnum<{
        add: "add";
        remove: "remove";
        update: "update";
    }>;
    physicalAddress: z.ZodNullable<z.ZodString>;
    tenantBranding: z.ZodObject<{
        terminology: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        teamRoleCopy: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>;
    agent: z.ZodObject<{
        relloAgentId: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        slug: z.ZodString;
        role: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        photoUrl: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        tagline: z.ZodOptional<z.ZodString>;
        brokerageName: z.ZodOptional<z.ZodString>;
        brokerageLogoUrl: z.ZodOptional<z.ZodString>;
        brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
        licenseNumber: z.ZodOptional<z.ZodString>;
        licenseState: z.ZodOptional<z.ZodString>;
        nmlsNumber: z.ZodOptional<z.ZodString>;
        websiteUrl: z.ZodOptional<z.ZodString>;
        applicationUrl: z.ZodOptional<z.ZodString>;
        social: z.ZodOptional<z.ZodUnknown>;
        mloName: z.ZodOptional<z.ZodString>;
        mloNmls: z.ZodOptional<z.ZodString>;
        emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
    wizardAnswers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        question: z.ZodString;
        answer: z.ZodUnknown;
    }, z.core.$strict>>>;
    agentNotificationPreference: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        notifyByEmail: z.ZodBoolean;
        notifyBySms: z.ZodBoolean;
        notifyByPush: z.ZodBoolean;
        dailyDigest: z.ZodBoolean;
        weeklyAnalytics: z.ZodBoolean;
    }, z.core.$strict>>>;
    agentProfile: z.ZodOptional<z.ZodObject<{
        specialtySentence: z.ZodOptional<z.ZodString>;
        experienceStatement: z.ZodOptional<z.ZodString>;
        typicalClient: z.ZodArray<z.ZodString>;
        areasServed: z.ZodArray<z.ZodString>;
        designations: z.ZodArray<z.ZodString>;
        emailTone: z.ZodOptional<z.ZodString>;
        soloOrTeam: z.ZodOptional<z.ZodString>;
        preferredContactMethod: z.ZodOptional<z.ZodString>;
        calendarLink: z.ZodOptional<z.ZodString>;
        aboutMeFacts: z.ZodOptional<z.ZodString>;
        avoidTopics: z.ZodArray<z.ZodString>;
        emphasizeTopics: z.ZodArray<z.ZodString>;
        sensitiveTopics: z.ZodArray<z.ZodString>;
        introductionDraft: z.ZodOptional<z.ZodString>;
        signoffStyle: z.ZodOptional<z.ZodString>;
        successStorySeeds: z.ZodOptional<z.ZodUnknown>;
        sendFrequency: z.ZodOptional<z.ZodString>;
        newsletterTemplateId: z.ZodOptional<z.ZodString>;
        brandColors: z.ZodOptional<z.ZodUnknown>;
        leadSourceContext: z.ZodOptional<z.ZodString>;
        licensedStates: z.ZodOptional<z.ZodArray<z.ZodString>>;
        pfpDefaultLender: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        pfpDefaultLoanPrograms: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            CONV: "CONV";
            FHA: "FHA";
            VA: "VA";
            USDA: "USDA";
            JUMBO: "JUMBO";
            NONQM: "NONQM";
        }>>>;
        pfpDefaultRateSource: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        pfpEqualHousingLogoPlacement: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            header: "header";
            footer: "footer";
            both: "both";
            none: "none";
        }>>>;
        pfpDefaultCreditPullPreference: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            soft: "soft";
            hard: "hard";
            borrower_choice: "borrower_choice";
        }>>>;
        pfpWizardCompletedAt: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const AgentProvisioningPayloadSchema_v0_6_0: z.ZodObject<{
    tenantId: z.ZodString;
    syncedAt: z.ZodString;
    force: z.ZodOptional<z.ZodLiteral<true>>;
    action: z.ZodEnum<{
        add: "add";
        remove: "remove";
        update: "update";
    }>;
    physicalAddress: z.ZodNullable<z.ZodString>;
    tenantBranding: z.ZodObject<{
        terminology: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        teamRoleCopy: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>;
    wizardAnswers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        question: z.ZodString;
        answer: z.ZodUnknown;
    }, z.core.$strict>>>;
    agentNotificationPreference: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        notifyByEmail: z.ZodBoolean;
        notifyBySms: z.ZodBoolean;
        notifyByPush: z.ZodBoolean;
        dailyDigest: z.ZodBoolean;
        weeklyAnalytics: z.ZodBoolean;
    }, z.core.$strict>>>;
    agentProfile: z.ZodOptional<z.ZodObject<{
        specialtySentence: z.ZodOptional<z.ZodString>;
        experienceStatement: z.ZodOptional<z.ZodString>;
        typicalClient: z.ZodArray<z.ZodString>;
        areasServed: z.ZodArray<z.ZodString>;
        designations: z.ZodArray<z.ZodString>;
        emailTone: z.ZodOptional<z.ZodString>;
        soloOrTeam: z.ZodOptional<z.ZodString>;
        preferredContactMethod: z.ZodOptional<z.ZodString>;
        calendarLink: z.ZodOptional<z.ZodString>;
        aboutMeFacts: z.ZodOptional<z.ZodString>;
        avoidTopics: z.ZodArray<z.ZodString>;
        emphasizeTopics: z.ZodArray<z.ZodString>;
        sensitiveTopics: z.ZodArray<z.ZodString>;
        introductionDraft: z.ZodOptional<z.ZodString>;
        signoffStyle: z.ZodOptional<z.ZodString>;
        successStorySeeds: z.ZodOptional<z.ZodUnknown>;
        sendFrequency: z.ZodOptional<z.ZodString>;
        newsletterTemplateId: z.ZodOptional<z.ZodString>;
        brandColors: z.ZodOptional<z.ZodUnknown>;
        leadSourceContext: z.ZodOptional<z.ZodString>;
        licensedStates: z.ZodOptional<z.ZodArray<z.ZodString>>;
        pfpDefaultLender: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        pfpDefaultLoanPrograms: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            CONV: "CONV";
            FHA: "FHA";
            VA: "VA";
            USDA: "USDA";
            JUMBO: "JUMBO";
            NONQM: "NONQM";
        }>>>;
        pfpDefaultRateSource: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        pfpEqualHousingLogoPlacement: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            header: "header";
            footer: "footer";
            both: "both";
            none: "none";
        }>>>;
        pfpDefaultCreditPullPreference: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            soft: "soft";
            hard: "hard";
            borrower_choice: "borrower_choice";
        }>>>;
        pfpWizardCompletedAt: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
    }, z.core.$strict>>;
    agent: z.ZodObject<{
        relloAgentId: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        slug: z.ZodString;
        role: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        photoUrl: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        tagline: z.ZodOptional<z.ZodString>;
        brokerageName: z.ZodOptional<z.ZodString>;
        brokerageLogoUrl: z.ZodOptional<z.ZodString>;
        brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
        licenseNumber: z.ZodOptional<z.ZodString>;
        licenseState: z.ZodOptional<z.ZodString>;
        nmlsNumber: z.ZodOptional<z.ZodString>;
        websiteUrl: z.ZodOptional<z.ZodString>;
        applicationUrl: z.ZodOptional<z.ZodString>;
        social: z.ZodOptional<z.ZodUnknown>;
        mloName: z.ZodOptional<z.ZodString>;
        mloNmls: z.ZodOptional<z.ZodString>;
        emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        relloUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const AgentProvisioningPayloadSchema_v0_7_0: z.ZodObject<{
    tenantId: z.ZodString;
    syncedAt: z.ZodString;
    force: z.ZodOptional<z.ZodLiteral<true>>;
    action: z.ZodEnum<{
        add: "add";
        remove: "remove";
        update: "update";
    }>;
    physicalAddress: z.ZodNullable<z.ZodString>;
    tenantBranding: z.ZodObject<{
        terminology: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        teamRoleCopy: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>;
    wizardAnswers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        question: z.ZodString;
        answer: z.ZodUnknown;
    }, z.core.$strict>>>;
    agentNotificationPreference: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        notifyByEmail: z.ZodBoolean;
        notifyBySms: z.ZodBoolean;
        notifyByPush: z.ZodBoolean;
        dailyDigest: z.ZodBoolean;
        weeklyAnalytics: z.ZodBoolean;
    }, z.core.$strict>>>;
    agentProfile: z.ZodOptional<z.ZodObject<{
        specialtySentence: z.ZodOptional<z.ZodString>;
        experienceStatement: z.ZodOptional<z.ZodString>;
        typicalClient: z.ZodArray<z.ZodString>;
        areasServed: z.ZodArray<z.ZodString>;
        designations: z.ZodArray<z.ZodString>;
        emailTone: z.ZodOptional<z.ZodString>;
        soloOrTeam: z.ZodOptional<z.ZodString>;
        preferredContactMethod: z.ZodOptional<z.ZodString>;
        calendarLink: z.ZodOptional<z.ZodString>;
        aboutMeFacts: z.ZodOptional<z.ZodString>;
        avoidTopics: z.ZodArray<z.ZodString>;
        emphasizeTopics: z.ZodArray<z.ZodString>;
        sensitiveTopics: z.ZodArray<z.ZodString>;
        introductionDraft: z.ZodOptional<z.ZodString>;
        signoffStyle: z.ZodOptional<z.ZodString>;
        successStorySeeds: z.ZodOptional<z.ZodUnknown>;
        sendFrequency: z.ZodOptional<z.ZodString>;
        newsletterTemplateId: z.ZodOptional<z.ZodString>;
        brandColors: z.ZodOptional<z.ZodUnknown>;
        leadSourceContext: z.ZodOptional<z.ZodString>;
        licensedStates: z.ZodOptional<z.ZodArray<z.ZodString>>;
        pfpDefaultLender: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        pfpDefaultLoanPrograms: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            CONV: "CONV";
            FHA: "FHA";
            VA: "VA";
            USDA: "USDA";
            JUMBO: "JUMBO";
            NONQM: "NONQM";
        }>>>;
        pfpDefaultRateSource: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        pfpEqualHousingLogoPlacement: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            header: "header";
            footer: "footer";
            both: "both";
            none: "none";
        }>>>;
        pfpDefaultCreditPullPreference: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            soft: "soft";
            hard: "hard";
            borrower_choice: "borrower_choice";
        }>>>;
        pfpWizardCompletedAt: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
    }, z.core.$strict>>;
    agent: z.ZodObject<{
        relloAgentId: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        slug: z.ZodString;
        role: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        photoUrl: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        tagline: z.ZodOptional<z.ZodString>;
        brokerageName: z.ZodOptional<z.ZodString>;
        brokerageLogoUrl: z.ZodOptional<z.ZodString>;
        brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
        licenseNumber: z.ZodOptional<z.ZodString>;
        licenseState: z.ZodOptional<z.ZodString>;
        nmlsNumber: z.ZodOptional<z.ZodString>;
        websiteUrl: z.ZodOptional<z.ZodString>;
        applicationUrl: z.ZodOptional<z.ZodString>;
        social: z.ZodOptional<z.ZodUnknown>;
        mloName: z.ZodOptional<z.ZodString>;
        mloNmls: z.ZodOptional<z.ZodString>;
        emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        relloUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        roles: z.ZodOptional<z.ZodArray<z.ZodString>>;
        licenses: z.ZodOptional<z.ZodObject<{
            mlo: z.ZodOptional<z.ZodObject<{
                nmlsNumber: z.ZodOptional<z.ZodString>;
                states: z.ZodArray<z.ZodString>;
                firmName: z.ZodOptional<z.ZodString>;
                firmLicense: z.ZodOptional<z.ZodString>;
                firmLogoUrl: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            re: z.ZodOptional<z.ZodObject<{
                licenseNumber: z.ZodOptional<z.ZodString>;
                states: z.ZodArray<z.ZodString>;
                firmName: z.ZodOptional<z.ZodString>;
                firmLicense: z.ZodOptional<z.ZodString>;
                firmLogoUrl: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const AgentProvisioningPayloadSchema: z.ZodObject<{
    tenantId: z.ZodString;
    syncedAt: z.ZodString;
    force: z.ZodOptional<z.ZodLiteral<true>>;
    action: z.ZodEnum<{
        add: "add";
        remove: "remove";
        update: "update";
    }>;
    physicalAddress: z.ZodNullable<z.ZodString>;
    tenantBranding: z.ZodObject<{
        terminology: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        teamRoleCopy: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>;
    wizardAnswers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        question: z.ZodString;
        answer: z.ZodUnknown;
    }, z.core.$strict>>>;
    agentNotificationPreference: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        notifyByEmail: z.ZodBoolean;
        notifyBySms: z.ZodBoolean;
        notifyByPush: z.ZodBoolean;
        dailyDigest: z.ZodBoolean;
        weeklyAnalytics: z.ZodBoolean;
    }, z.core.$strict>>>;
    agentProfile: z.ZodOptional<z.ZodObject<{
        specialtySentence: z.ZodOptional<z.ZodString>;
        experienceStatement: z.ZodOptional<z.ZodString>;
        typicalClient: z.ZodArray<z.ZodString>;
        areasServed: z.ZodArray<z.ZodString>;
        designations: z.ZodArray<z.ZodString>;
        emailTone: z.ZodOptional<z.ZodString>;
        soloOrTeam: z.ZodOptional<z.ZodString>;
        preferredContactMethod: z.ZodOptional<z.ZodString>;
        calendarLink: z.ZodOptional<z.ZodString>;
        aboutMeFacts: z.ZodOptional<z.ZodString>;
        avoidTopics: z.ZodArray<z.ZodString>;
        emphasizeTopics: z.ZodArray<z.ZodString>;
        sensitiveTopics: z.ZodArray<z.ZodString>;
        introductionDraft: z.ZodOptional<z.ZodString>;
        signoffStyle: z.ZodOptional<z.ZodString>;
        successStorySeeds: z.ZodOptional<z.ZodUnknown>;
        sendFrequency: z.ZodOptional<z.ZodString>;
        newsletterTemplateId: z.ZodOptional<z.ZodString>;
        brandColors: z.ZodOptional<z.ZodUnknown>;
        leadSourceContext: z.ZodOptional<z.ZodString>;
        licensedStates: z.ZodOptional<z.ZodArray<z.ZodString>>;
        pfpDefaultLender: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        pfpDefaultLoanPrograms: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            CONV: "CONV";
            FHA: "FHA";
            VA: "VA";
            USDA: "USDA";
            JUMBO: "JUMBO";
            NONQM: "NONQM";
        }>>>;
        pfpDefaultRateSource: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        pfpEqualHousingLogoPlacement: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            header: "header";
            footer: "footer";
            both: "both";
            none: "none";
        }>>>;
        pfpDefaultCreditPullPreference: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            soft: "soft";
            hard: "hard";
            borrower_choice: "borrower_choice";
        }>>>;
        pfpWizardCompletedAt: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
    }, z.core.$strict>>;
    agent: z.ZodObject<{
        relloAgentId: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        slug: z.ZodString;
        role: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        photoUrl: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        tagline: z.ZodOptional<z.ZodString>;
        brokerageName: z.ZodOptional<z.ZodString>;
        brokerageLogoUrl: z.ZodOptional<z.ZodString>;
        brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
        licenseNumber: z.ZodOptional<z.ZodString>;
        licenseState: z.ZodOptional<z.ZodString>;
        nmlsNumber: z.ZodOptional<z.ZodString>;
        websiteUrl: z.ZodOptional<z.ZodString>;
        applicationUrl: z.ZodOptional<z.ZodString>;
        social: z.ZodOptional<z.ZodUnknown>;
        mloName: z.ZodOptional<z.ZodString>;
        mloNmls: z.ZodOptional<z.ZodString>;
        emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        relloUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        roles: z.ZodOptional<z.ZodArray<z.ZodString>>;
        licenses: z.ZodOptional<z.ZodObject<{
            mlo: z.ZodOptional<z.ZodObject<{
                nmlsNumber: z.ZodOptional<z.ZodString>;
                states: z.ZodArray<z.ZodString>;
                firmName: z.ZodOptional<z.ZodString>;
                firmLicense: z.ZodOptional<z.ZodString>;
                firmLogoUrl: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            re: z.ZodOptional<z.ZodObject<{
                licenseNumber: z.ZodOptional<z.ZodString>;
                states: z.ZodArray<z.ZodString>;
                firmName: z.ZodOptional<z.ZodString>;
                firmLicense: z.ZodOptional<z.ZodString>;
                firmLogoUrl: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const BASELINE_SCHEMA_VERSION: "v0.3.0";
export declare const PACKAGE_SCHEMA_VERSION: "v0.7.0";
export declare const VERSIONED_SCHEMAS: {
    readonly "v0.3.0": z.ZodObject<{
        tenantId: z.ZodString;
        syncedAt: z.ZodString;
        force: z.ZodOptional<z.ZodLiteral<true>>;
        action: z.ZodEnum<{
            add: "add";
            remove: "remove";
            update: "update";
        }>;
        physicalAddress: z.ZodNullable<z.ZodString>;
        tenantBranding: z.ZodObject<{
            terminology: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            teamRoleCopy: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strict>;
        agent: z.ZodObject<{
            relloAgentId: z.ZodString;
            email: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            slug: z.ZodString;
            role: z.ZodString;
            phone: z.ZodNullable<z.ZodString>;
            photoUrl: z.ZodOptional<z.ZodString>;
            bio: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            tagline: z.ZodOptional<z.ZodString>;
            brokerageName: z.ZodOptional<z.ZodString>;
            brokerageLogoUrl: z.ZodOptional<z.ZodString>;
            brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
            licenseNumber: z.ZodOptional<z.ZodString>;
            licenseState: z.ZodOptional<z.ZodString>;
            nmlsNumber: z.ZodOptional<z.ZodString>;
            websiteUrl: z.ZodOptional<z.ZodString>;
            applicationUrl: z.ZodOptional<z.ZodString>;
            social: z.ZodOptional<z.ZodUnknown>;
            mloName: z.ZodOptional<z.ZodString>;
            mloNmls: z.ZodOptional<z.ZodString>;
            emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strict>;
        agentProfile: z.ZodOptional<z.ZodObject<{
            specialtySentence: z.ZodOptional<z.ZodString>;
            experienceStatement: z.ZodOptional<z.ZodString>;
            typicalClient: z.ZodArray<z.ZodString>;
            areasServed: z.ZodArray<z.ZodString>;
            designations: z.ZodArray<z.ZodString>;
            emailTone: z.ZodOptional<z.ZodString>;
            soloOrTeam: z.ZodOptional<z.ZodString>;
            preferredContactMethod: z.ZodOptional<z.ZodString>;
            calendarLink: z.ZodOptional<z.ZodString>;
            aboutMeFacts: z.ZodOptional<z.ZodString>;
            avoidTopics: z.ZodArray<z.ZodString>;
            emphasizeTopics: z.ZodArray<z.ZodString>;
            sensitiveTopics: z.ZodArray<z.ZodString>;
            introductionDraft: z.ZodOptional<z.ZodString>;
            signoffStyle: z.ZodOptional<z.ZodString>;
            successStorySeeds: z.ZodOptional<z.ZodUnknown>;
            sendFrequency: z.ZodOptional<z.ZodString>;
            newsletterTemplateId: z.ZodOptional<z.ZodString>;
            brandColors: z.ZodOptional<z.ZodUnknown>;
            leadSourceContext: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        wizardAnswers: z.ZodOptional<z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            question: z.ZodString;
            answer: z.ZodUnknown;
        }, z.core.$strict>>>;
        agentNotificationPreference: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            notifyByEmail: z.ZodBoolean;
            notifyBySms: z.ZodBoolean;
            notifyByPush: z.ZodBoolean;
            dailyDigest: z.ZodBoolean;
            weeklyAnalytics: z.ZodBoolean;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    readonly "v0.4.0": z.ZodObject<{
        tenantId: z.ZodString;
        syncedAt: z.ZodString;
        force: z.ZodOptional<z.ZodLiteral<true>>;
        action: z.ZodEnum<{
            add: "add";
            remove: "remove";
            update: "update";
        }>;
        physicalAddress: z.ZodNullable<z.ZodString>;
        tenantBranding: z.ZodObject<{
            terminology: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            teamRoleCopy: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strict>;
        agent: z.ZodObject<{
            relloAgentId: z.ZodString;
            email: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            slug: z.ZodString;
            role: z.ZodString;
            phone: z.ZodNullable<z.ZodString>;
            photoUrl: z.ZodOptional<z.ZodString>;
            bio: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            tagline: z.ZodOptional<z.ZodString>;
            brokerageName: z.ZodOptional<z.ZodString>;
            brokerageLogoUrl: z.ZodOptional<z.ZodString>;
            brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
            licenseNumber: z.ZodOptional<z.ZodString>;
            licenseState: z.ZodOptional<z.ZodString>;
            nmlsNumber: z.ZodOptional<z.ZodString>;
            websiteUrl: z.ZodOptional<z.ZodString>;
            applicationUrl: z.ZodOptional<z.ZodString>;
            social: z.ZodOptional<z.ZodUnknown>;
            mloName: z.ZodOptional<z.ZodString>;
            mloNmls: z.ZodOptional<z.ZodString>;
            emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strict>;
        wizardAnswers: z.ZodOptional<z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            question: z.ZodString;
            answer: z.ZodUnknown;
        }, z.core.$strict>>>;
        agentNotificationPreference: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            notifyByEmail: z.ZodBoolean;
            notifyBySms: z.ZodBoolean;
            notifyByPush: z.ZodBoolean;
            dailyDigest: z.ZodBoolean;
            weeklyAnalytics: z.ZodBoolean;
        }, z.core.$strict>>>;
        agentProfile: z.ZodOptional<z.ZodObject<{
            specialtySentence: z.ZodOptional<z.ZodString>;
            experienceStatement: z.ZodOptional<z.ZodString>;
            typicalClient: z.ZodArray<z.ZodString>;
            areasServed: z.ZodArray<z.ZodString>;
            designations: z.ZodArray<z.ZodString>;
            emailTone: z.ZodOptional<z.ZodString>;
            soloOrTeam: z.ZodOptional<z.ZodString>;
            preferredContactMethod: z.ZodOptional<z.ZodString>;
            calendarLink: z.ZodOptional<z.ZodString>;
            aboutMeFacts: z.ZodOptional<z.ZodString>;
            avoidTopics: z.ZodArray<z.ZodString>;
            emphasizeTopics: z.ZodArray<z.ZodString>;
            sensitiveTopics: z.ZodArray<z.ZodString>;
            introductionDraft: z.ZodOptional<z.ZodString>;
            signoffStyle: z.ZodOptional<z.ZodString>;
            successStorySeeds: z.ZodOptional<z.ZodUnknown>;
            sendFrequency: z.ZodOptional<z.ZodString>;
            newsletterTemplateId: z.ZodOptional<z.ZodString>;
            brandColors: z.ZodOptional<z.ZodUnknown>;
            leadSourceContext: z.ZodOptional<z.ZodString>;
            licensedStates: z.ZodOptional<z.ZodArray<z.ZodString>>;
            pfpDefaultLender: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            pfpDefaultLoanPrograms: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                CONV: "CONV";
                FHA: "FHA";
                VA: "VA";
                USDA: "USDA";
                JUMBO: "JUMBO";
                NONQM: "NONQM";
            }>>>;
            pfpDefaultRateSource: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            pfpEqualHousingLogoPlacement: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
                header: "header";
                footer: "footer";
                both: "both";
                none: "none";
            }>>>;
            pfpDefaultCreditPullPreference: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
                soft: "soft";
                hard: "hard";
                borrower_choice: "borrower_choice";
            }>>>;
            pfpWizardCompletedAt: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly "v0.5.0": z.ZodObject<{
        tenantId: z.ZodString;
        syncedAt: z.ZodString;
        force: z.ZodOptional<z.ZodLiteral<true>>;
        action: z.ZodEnum<{
            add: "add";
            remove: "remove";
            update: "update";
        }>;
        physicalAddress: z.ZodNullable<z.ZodString>;
        tenantBranding: z.ZodObject<{
            terminology: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            teamRoleCopy: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strict>;
        agent: z.ZodObject<{
            relloAgentId: z.ZodString;
            email: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            slug: z.ZodString;
            role: z.ZodString;
            phone: z.ZodNullable<z.ZodString>;
            photoUrl: z.ZodOptional<z.ZodString>;
            bio: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            tagline: z.ZodOptional<z.ZodString>;
            brokerageName: z.ZodOptional<z.ZodString>;
            brokerageLogoUrl: z.ZodOptional<z.ZodString>;
            brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
            licenseNumber: z.ZodOptional<z.ZodString>;
            licenseState: z.ZodOptional<z.ZodString>;
            nmlsNumber: z.ZodOptional<z.ZodString>;
            websiteUrl: z.ZodOptional<z.ZodString>;
            applicationUrl: z.ZodOptional<z.ZodString>;
            social: z.ZodOptional<z.ZodUnknown>;
            mloName: z.ZodOptional<z.ZodString>;
            mloNmls: z.ZodOptional<z.ZodString>;
            emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strict>;
        wizardAnswers: z.ZodOptional<z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            question: z.ZodString;
            answer: z.ZodUnknown;
        }, z.core.$strict>>>;
        agentNotificationPreference: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            notifyByEmail: z.ZodBoolean;
            notifyBySms: z.ZodBoolean;
            notifyByPush: z.ZodBoolean;
            dailyDigest: z.ZodBoolean;
            weeklyAnalytics: z.ZodBoolean;
        }, z.core.$strict>>>;
        agentProfile: z.ZodOptional<z.ZodObject<{
            specialtySentence: z.ZodOptional<z.ZodString>;
            experienceStatement: z.ZodOptional<z.ZodString>;
            typicalClient: z.ZodArray<z.ZodString>;
            areasServed: z.ZodArray<z.ZodString>;
            designations: z.ZodArray<z.ZodString>;
            emailTone: z.ZodOptional<z.ZodString>;
            soloOrTeam: z.ZodOptional<z.ZodString>;
            preferredContactMethod: z.ZodOptional<z.ZodString>;
            calendarLink: z.ZodOptional<z.ZodString>;
            aboutMeFacts: z.ZodOptional<z.ZodString>;
            avoidTopics: z.ZodArray<z.ZodString>;
            emphasizeTopics: z.ZodArray<z.ZodString>;
            sensitiveTopics: z.ZodArray<z.ZodString>;
            introductionDraft: z.ZodOptional<z.ZodString>;
            signoffStyle: z.ZodOptional<z.ZodString>;
            successStorySeeds: z.ZodOptional<z.ZodUnknown>;
            sendFrequency: z.ZodOptional<z.ZodString>;
            newsletterTemplateId: z.ZodOptional<z.ZodString>;
            brandColors: z.ZodOptional<z.ZodUnknown>;
            leadSourceContext: z.ZodOptional<z.ZodString>;
            licensedStates: z.ZodOptional<z.ZodArray<z.ZodString>>;
            pfpDefaultLender: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            pfpDefaultLoanPrograms: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                CONV: "CONV";
                FHA: "FHA";
                VA: "VA";
                USDA: "USDA";
                JUMBO: "JUMBO";
                NONQM: "NONQM";
            }>>>;
            pfpDefaultRateSource: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            pfpEqualHousingLogoPlacement: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
                header: "header";
                footer: "footer";
                both: "both";
                none: "none";
            }>>>;
            pfpDefaultCreditPullPreference: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
                soft: "soft";
                hard: "hard";
                borrower_choice: "borrower_choice";
            }>>>;
            pfpWizardCompletedAt: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly "v0.6.0": z.ZodObject<{
        tenantId: z.ZodString;
        syncedAt: z.ZodString;
        force: z.ZodOptional<z.ZodLiteral<true>>;
        action: z.ZodEnum<{
            add: "add";
            remove: "remove";
            update: "update";
        }>;
        physicalAddress: z.ZodNullable<z.ZodString>;
        tenantBranding: z.ZodObject<{
            terminology: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            teamRoleCopy: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strict>;
        wizardAnswers: z.ZodOptional<z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            question: z.ZodString;
            answer: z.ZodUnknown;
        }, z.core.$strict>>>;
        agentNotificationPreference: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            notifyByEmail: z.ZodBoolean;
            notifyBySms: z.ZodBoolean;
            notifyByPush: z.ZodBoolean;
            dailyDigest: z.ZodBoolean;
            weeklyAnalytics: z.ZodBoolean;
        }, z.core.$strict>>>;
        agentProfile: z.ZodOptional<z.ZodObject<{
            specialtySentence: z.ZodOptional<z.ZodString>;
            experienceStatement: z.ZodOptional<z.ZodString>;
            typicalClient: z.ZodArray<z.ZodString>;
            areasServed: z.ZodArray<z.ZodString>;
            designations: z.ZodArray<z.ZodString>;
            emailTone: z.ZodOptional<z.ZodString>;
            soloOrTeam: z.ZodOptional<z.ZodString>;
            preferredContactMethod: z.ZodOptional<z.ZodString>;
            calendarLink: z.ZodOptional<z.ZodString>;
            aboutMeFacts: z.ZodOptional<z.ZodString>;
            avoidTopics: z.ZodArray<z.ZodString>;
            emphasizeTopics: z.ZodArray<z.ZodString>;
            sensitiveTopics: z.ZodArray<z.ZodString>;
            introductionDraft: z.ZodOptional<z.ZodString>;
            signoffStyle: z.ZodOptional<z.ZodString>;
            successStorySeeds: z.ZodOptional<z.ZodUnknown>;
            sendFrequency: z.ZodOptional<z.ZodString>;
            newsletterTemplateId: z.ZodOptional<z.ZodString>;
            brandColors: z.ZodOptional<z.ZodUnknown>;
            leadSourceContext: z.ZodOptional<z.ZodString>;
            licensedStates: z.ZodOptional<z.ZodArray<z.ZodString>>;
            pfpDefaultLender: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            pfpDefaultLoanPrograms: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                CONV: "CONV";
                FHA: "FHA";
                VA: "VA";
                USDA: "USDA";
                JUMBO: "JUMBO";
                NONQM: "NONQM";
            }>>>;
            pfpDefaultRateSource: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            pfpEqualHousingLogoPlacement: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
                header: "header";
                footer: "footer";
                both: "both";
                none: "none";
            }>>>;
            pfpDefaultCreditPullPreference: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
                soft: "soft";
                hard: "hard";
                borrower_choice: "borrower_choice";
            }>>>;
            pfpWizardCompletedAt: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
        }, z.core.$strict>>;
        agent: z.ZodObject<{
            relloAgentId: z.ZodString;
            email: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            slug: z.ZodString;
            role: z.ZodString;
            phone: z.ZodNullable<z.ZodString>;
            photoUrl: z.ZodOptional<z.ZodString>;
            bio: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            tagline: z.ZodOptional<z.ZodString>;
            brokerageName: z.ZodOptional<z.ZodString>;
            brokerageLogoUrl: z.ZodOptional<z.ZodString>;
            brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
            licenseNumber: z.ZodOptional<z.ZodString>;
            licenseState: z.ZodOptional<z.ZodString>;
            nmlsNumber: z.ZodOptional<z.ZodString>;
            websiteUrl: z.ZodOptional<z.ZodString>;
            applicationUrl: z.ZodOptional<z.ZodString>;
            social: z.ZodOptional<z.ZodUnknown>;
            mloName: z.ZodOptional<z.ZodString>;
            mloNmls: z.ZodOptional<z.ZodString>;
            emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            relloUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    readonly "v0.7.0": z.ZodObject<{
        tenantId: z.ZodString;
        syncedAt: z.ZodString;
        force: z.ZodOptional<z.ZodLiteral<true>>;
        action: z.ZodEnum<{
            add: "add";
            remove: "remove";
            update: "update";
        }>;
        physicalAddress: z.ZodNullable<z.ZodString>;
        tenantBranding: z.ZodObject<{
            terminology: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            teamRoleCopy: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strict>;
        wizardAnswers: z.ZodOptional<z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            question: z.ZodString;
            answer: z.ZodUnknown;
        }, z.core.$strict>>>;
        agentNotificationPreference: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            notifyByEmail: z.ZodBoolean;
            notifyBySms: z.ZodBoolean;
            notifyByPush: z.ZodBoolean;
            dailyDigest: z.ZodBoolean;
            weeklyAnalytics: z.ZodBoolean;
        }, z.core.$strict>>>;
        agentProfile: z.ZodOptional<z.ZodObject<{
            specialtySentence: z.ZodOptional<z.ZodString>;
            experienceStatement: z.ZodOptional<z.ZodString>;
            typicalClient: z.ZodArray<z.ZodString>;
            areasServed: z.ZodArray<z.ZodString>;
            designations: z.ZodArray<z.ZodString>;
            emailTone: z.ZodOptional<z.ZodString>;
            soloOrTeam: z.ZodOptional<z.ZodString>;
            preferredContactMethod: z.ZodOptional<z.ZodString>;
            calendarLink: z.ZodOptional<z.ZodString>;
            aboutMeFacts: z.ZodOptional<z.ZodString>;
            avoidTopics: z.ZodArray<z.ZodString>;
            emphasizeTopics: z.ZodArray<z.ZodString>;
            sensitiveTopics: z.ZodArray<z.ZodString>;
            introductionDraft: z.ZodOptional<z.ZodString>;
            signoffStyle: z.ZodOptional<z.ZodString>;
            successStorySeeds: z.ZodOptional<z.ZodUnknown>;
            sendFrequency: z.ZodOptional<z.ZodString>;
            newsletterTemplateId: z.ZodOptional<z.ZodString>;
            brandColors: z.ZodOptional<z.ZodUnknown>;
            leadSourceContext: z.ZodOptional<z.ZodString>;
            licensedStates: z.ZodOptional<z.ZodArray<z.ZodString>>;
            pfpDefaultLender: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            pfpDefaultLoanPrograms: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                CONV: "CONV";
                FHA: "FHA";
                VA: "VA";
                USDA: "USDA";
                JUMBO: "JUMBO";
                NONQM: "NONQM";
            }>>>;
            pfpDefaultRateSource: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            pfpEqualHousingLogoPlacement: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
                header: "header";
                footer: "footer";
                both: "both";
                none: "none";
            }>>>;
            pfpDefaultCreditPullPreference: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
                soft: "soft";
                hard: "hard";
                borrower_choice: "borrower_choice";
            }>>>;
            pfpWizardCompletedAt: z.ZodNullable<z.ZodOptional<z.ZodCoercedDate<unknown>>>;
        }, z.core.$strict>>;
        agent: z.ZodObject<{
            relloAgentId: z.ZodString;
            email: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            slug: z.ZodString;
            role: z.ZodString;
            phone: z.ZodNullable<z.ZodString>;
            photoUrl: z.ZodOptional<z.ZodString>;
            bio: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            tagline: z.ZodOptional<z.ZodString>;
            brokerageName: z.ZodOptional<z.ZodString>;
            brokerageLogoUrl: z.ZodOptional<z.ZodString>;
            brokerageLicenseNumber: z.ZodOptional<z.ZodString>;
            licenseNumber: z.ZodOptional<z.ZodString>;
            licenseState: z.ZodOptional<z.ZodString>;
            nmlsNumber: z.ZodOptional<z.ZodString>;
            websiteUrl: z.ZodOptional<z.ZodString>;
            applicationUrl: z.ZodOptional<z.ZodString>;
            social: z.ZodOptional<z.ZodUnknown>;
            mloName: z.ZodOptional<z.ZodString>;
            mloNmls: z.ZodOptional<z.ZodString>;
            emailSignature: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            relloUserId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            roles: z.ZodOptional<z.ZodArray<z.ZodString>>;
            licenses: z.ZodOptional<z.ZodObject<{
                mlo: z.ZodOptional<z.ZodObject<{
                    nmlsNumber: z.ZodOptional<z.ZodString>;
                    states: z.ZodArray<z.ZodString>;
                    firmName: z.ZodOptional<z.ZodString>;
                    firmLicense: z.ZodOptional<z.ZodString>;
                    firmLogoUrl: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
                re: z.ZodOptional<z.ZodObject<{
                    licenseNumber: z.ZodOptional<z.ZodString>;
                    states: z.ZodArray<z.ZodString>;
                    firmName: z.ZodOptional<z.ZodString>;
                    firmLicense: z.ZodOptional<z.ZodString>;
                    firmLogoUrl: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
};
export type SupportedSchemaVersion = keyof typeof VERSIONED_SCHEMAS;
export type AgentProvisioningPayload = z.infer<typeof AgentProvisioningPayloadSchema>;
export type AgentPayload = z.infer<typeof AgentPayloadSchema>;
export type AgentProfilePayload = z.infer<typeof AgentProfilePayloadSchema>;
export type TenantBrandingPayload = z.infer<typeof TenantBrandingPayloadSchema>;
export type WizardAnswerPayload = z.infer<typeof WizardAnswerPayloadSchema>;
export type AgentNotificationPreferencePayload = z.infer<typeof AgentNotificationPreferencePayloadSchema>;
//# sourceMappingURL=payload.d.ts.map