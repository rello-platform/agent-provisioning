# Changelog

Earlier releases are described in their merge commits (`git log`) and in README.md.

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
