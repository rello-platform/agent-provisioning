import { VERSIONED_SCHEMAS, BASELINE_SCHEMA_VERSION } from "./payload.js";
/**
 * Strip payload fields that the target spoke's schema version does not
 * declare. Uses `.shape` introspection — closed-form, no parallel field-map
 * to drift from the schema itself. Falls back to BASELINE_SCHEMA_VERSION
 * for unknown / unprobed targets (safe omit-everything-novel direction
 * per DL6).
 *
 * Recursive at one level: also projects the nested `agentProfile` block.
 * Future additions to other nested blocks (`agent`, `tenantBranding`)
 * follow the same pattern — extend `NESTED_KEYS` below.
 *
 * Returns:
 *   - `projected`: the payload with novel-version keys stripped
 *   - `omittedFields`: list of dotted paths that were dropped (auditable)
 *   - `resolvedVersion`: the version the helper actually projected against
 *     (matches `targetVersion` when known; else `BASELINE_SCHEMA_VERSION`)
 */
// `agent` joined `agentProfile` here in v0.6.0 (T5D): the agent block became
// compositionally versioned (added `relloUserId`), so it must be projected
// per-target like agentProfile — a spoke pinned < v0.6.0 has no `relloUserId`
// in its agent shape, so projection strips it and the spoke's `.strict()`
// receiver does not 400.
const NESTED_KEYS = ["agentProfile", "agent"];
function isNestedKey(key) {
    return NESTED_KEYS.includes(key);
}
function unwrapShape(schema) {
    const s = schema;
    return s?._def?.innerType?.shape ?? s?.shape ?? null;
}
export function projectPayloadForVersion(payload, targetVersion) {
    const resolvedVersion = targetVersion && targetVersion in VERSIONED_SCHEMAS
        ? targetVersion
        : BASELINE_SCHEMA_VERSION;
    const schema = VERSIONED_SCHEMAS[resolvedVersion];
    const rootShape = schema.shape;
    const rootKeys = new Set(Object.keys(rootShape));
    const omittedFields = [];
    const projected = {};
    for (const [key, value] of Object.entries(payload)) {
        if (!rootKeys.has(key)) {
            omittedFields.push(key);
            continue;
        }
        if (isNestedKey(key) && value && typeof value === "object" && !Array.isArray(value)) {
            const nestedShape = unwrapShape(rootShape[key]);
            if (nestedShape) {
                const nestedKeys = new Set(Object.keys(nestedShape));
                const nestedProjected = {};
                for (const [nKey, nVal] of Object.entries(value)) {
                    if (nestedKeys.has(nKey)) {
                        nestedProjected[nKey] = nVal;
                    }
                    else {
                        omittedFields.push(`${key}.${nKey}`);
                    }
                }
                projected[key] = nestedProjected;
                continue;
            }
        }
        projected[key] = value;
    }
    return { projected, omittedFields, resolvedVersion };
}
//# sourceMappingURL=project-for-version.js.map