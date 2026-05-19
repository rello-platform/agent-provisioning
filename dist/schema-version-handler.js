import { PACKAGE_SCHEMA_VERSION } from "./payload.js";
/**
 * Reference handler for spoke heartbeat endpoints. Spokes mount via
 *
 *   export { schemaVersionHandler as GET } from "@rello-platform/agent-provisioning";
 *
 * at `src/app/api/provisioning/schema-version/route.ts`. The handler
 * returns the schema version this package ships (DL1). Rello-side
 * `resolveSpokeSchemaVersion` reads this value pre-fan-out to pick
 * the per-spoke projection target.
 *
 * Public — no Bearer auth required (only emits the pinned package
 * version; no PII; no tenant data). Mirrors the unauthenticated
 * `/api/health.commit` precedent.
 *
 * Compatible with the Next.js App Router `route.ts` GET signature
 * (a function accepting a `Request` and returning a `Response`).
 */
export async function schemaVersionHandler(_req) {
    return new Response(JSON.stringify({ schemaVersion: PACKAGE_SCHEMA_VERSION }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
        },
    });
}
//# sourceMappingURL=schema-version-handler.js.map