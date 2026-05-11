import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AgentProvisioningPayloadSchema,
  AgentPayloadSchema,
  TenantBrandingPayloadSchema,
} from "./index.js";

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
