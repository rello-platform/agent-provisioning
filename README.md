# @rello-platform/agent-provisioning

Canonical zod schema for the Rello → spokes cascade payload (agent
provisioning), Wave 1 of PLATFORM CASCADING SETTINGS ARCHITECTURE.

Ships **schema-only** — no helpers, no network code. Spoke receivers
(via `@rello-platform/cascade::mirrorReceiver`) and the Rello-side
sender (via `@rello-platform/cascade::pushToSpokes`) import and parse
against the same exported schemas, so the contract cannot drift across
the cascade.

## Install

This package is published to GitHub Packages. The consuming repo
needs an `.npmrc`:

```
@rello-platform:registry=https://npm.pkg.github.com
```

Then:

```
npm install @rello-platform/agent-provisioning zod
```

### Peer dependencies

As of v0.1.1, `zod` is a **peer dependency** pinned to `^4.3.5` — the
consumer installs and resolves its own zod copy, so the schema files
in this package compile against the caller's zod. This eliminates the
dual-zod-in-bundle risk and matches the Rello CRM pin + the
`@rello-platform/oven-engagement` sibling pin so the cascade fleet
shares a single zod major across every receiver and sender. v0.1.0
declared zod under `dependencies@^3.23.0`; consumers should bump to
v0.1.1 to align peers.

## Usage

### Spoke side — validate inbound cascade body

```ts
import { mirrorReceiver } from "@rello-platform/cascade";
import { AgentProvisioningPayloadSchema } from "@rello-platform/agent-provisioning";
import { prisma } from "@/lib/prisma";

export const POST = mirrorReceiver(
  process.env.PROVISIONING_API_KEY!,
  AgentProvisioningPayloadSchema,
  async (parsed) => {
    await prisma.user.upsert({
      where: { relloAgentId_tenantId: { relloAgentId: parsed.agent.relloAgentId, tenantId: parsed.tenantId } },
      create: mapToUser(parsed),
      update: mapToUser(parsed),
    });
  },
);
```

### Rello side — validate before fan-out (defense in depth)

```ts
import { pushToSpokes } from "@rello-platform/cascade";
import { AgentProvisioningPayloadSchema, type AgentProvisioningPayload } from "@rello-platform/agent-provisioning";

const payload = {
  action: "update",
  physicalAddress: tenant.physicalAddress,
  tenantBranding: { terminology: ..., teamRoleCopy: ... },
  agent: { relloAgentId: ..., email: ..., ... },
  // agentProfile, wizardAnswers optional
};

// pushToSpokes injects { tenantId, syncedAt, force? } at the root,
// producing the full AgentProvisioningPayload shape on the wire.
const result = await pushToSpokes(tenantId, "agent", payload, { spokes });
```

## Exports

- `AgentProvisioningPayloadSchema` — the top-level wire contract.
- `AgentPayloadSchema` — the `agent` sub-object (required).
- `AgentProfilePayloadSchema` — the `agentProfile` sub-object (optional).
- `TenantBrandingPayloadSchema` — the `tenantBranding` sub-object (required).
- `WizardAnswerPayloadSchema` — single entry of the `wizardAnswers` array (optional).

Each schema exports a matching `z.infer<>` TypeScript type:
`AgentProvisioningPayload`, `AgentPayload`, `AgentProfilePayload`,
`TenantBrandingPayload`, `WizardAnswerPayload`.

## Contract

- All schemas use `.strict()` — unknown fields cause `safeParse` to
  return `success: false`, surfacing as 400 at the spoke receiver via
  `@rello-platform/cascade::mirrorReceiver`. This closes the
  asymmetric-receiver drift class observed in pre-cascade spokes
  (D-7, D-8, D-9 in the build doc).
- Breaking change from the pre-cascade payload shape: top-level
  `relloTenantId` has been removed. `tenantId` is now injected at the
  body root by `@rello-platform/cascade::pushToSpokes`. Consumers must
  read `parsed.tenantId`, not `parsed.relloTenantId`.
- `action` is one of `"add" | "remove" | "update"`.
- `force` (optional) must be the literal `true` — `false` is rejected
  to keep the happy-path unambiguous; omit the field to keep stale
  rejection enabled at the receiver.
- `syncedAt` is an ISO 8601 datetime string injected by `pushToSpokes`.

## Sibling packages

- `@rello-platform/cascade` — the helper layer (pushToSpokes,
  mirrorReceiver) this schema feeds.
- `@rello-platform/oven-engagement` — sibling schema-only package
  for the Rello → The Oven engagement-config sync.

## License

UNLICENSED — internal Rello Platform use only.
