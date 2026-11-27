# Changelog

Earlier releases are described in their merge commits (`git log`) and in README.md.

## v0.12.0 — tenant logo + colours on the branding block (unreleased)

- `tenantBranding` gains `logoUrl`, `primaryColor` and `accentColor`: all optional and
  nullable (absent = no change, `null` = cleared, a value = set). Mirrored from Rello
  `TenantBranding`, so a branding save reaches every app on the durable agent push.
  Platform KA prompt 2242 (SETTINGS-CASCADE C4; ruling on a5-2236 BLOCKER 1).
- New exports: `TenantBrandingPayloadSchema_v0_3_0` (the frozen pre-v0.12.0 block),
  `TenantBrandingPayloadSchema_v0_12_0`, `AgentProvisioningPayloadSchema_v0_12_0`,
  `TENANT_BRANDING_FIELDS_V0_12_0`. `VERSIONED_SCHEMAS["v0.12.0"]`; the latest aliases
  (`TenantBrandingPayloadSchema`, `AgentProvisioningPayloadSchema`) and
  `PACKAGE_SCHEMA_VERSION` move to v0.12.0.
- `projectPayloadForVersion` recurses into `tenantBranding`. Before this the block rode to
  a spoke whole: any new branding key would have 400'd every strict receiver pinned below
  the producer. A spoke pinned v0.3.0–v0.11.0, or unprobed, now receives byte-for-byte its
  pre-v0.12.0 payload (pinned by `src/tenant-branding-v0-12-0.test.ts`).

## v0.11.0 — brokerage identity on the licence facets (unreleased)

- `agent.licenses.mlo` / `agent.licenses.re` gain `firmLegalName`, `firmTradeNames`,
  `firmStateLicenses`, `firmHqAddress`, `firmStateDisclosureTokens` and `stateNumbers`:
  all optional and nullable (absent = no change, `null` = cleared, a value = set).
  Platform KA prompt 2140; design DESIGN-BROKERAGE-IDENTITY-261127.md §2, §4.1.
- New exports: `AgentPayloadSchema_v0_11_0`, `AgentProvisioningPayloadSchema_v0_11_0`,
  `LICENCE_FACET_FIELDS_V0_11_0`. `VERSIONED_SCHEMAS["v0.11.0"]`; the latest aliases and
  `PACKAGE_SCHEMA_VERSION` move to v0.11.0.
- `projectPayloadForVersion` recurses into `agent.licenses` facets. Before this, the
  facets rode to a spoke whole: any new facet key would have 400'd every strict receiver
  pinned below the producer. A spoke pinned v0.7.0–v0.10.0 now receives byte-for-byte its
  pre-v0.11.0 payload (pinned by `src/brokerage-identity-v0-11-0.test.ts`).
