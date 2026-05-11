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
}, z.core.$strict>;
export type AgentProvisioningPayload = z.infer<typeof AgentProvisioningPayloadSchema>;
export type AgentPayload = z.infer<typeof AgentPayloadSchema>;
export type AgentProfilePayload = z.infer<typeof AgentProfilePayloadSchema>;
export type TenantBrandingPayload = z.infer<typeof TenantBrandingPayloadSchema>;
export type WizardAnswerPayload = z.infer<typeof WizardAnswerPayloadSchema>;
//# sourceMappingURL=payload.d.ts.map