import { VERSIONED_SCHEMAS, BASELINE_SCHEMA_VERSION } from "./payload.js";
/**
 * Strip payload fields that the target spoke's schema version does not
 * declare. Uses `.shape` introspection — closed-form, no parallel field-map
 * to drift from the schema itself. Falls back to BASELINE_SCHEMA_VERSION
 * for unknown / unprobed targets (safe omit-everything-novel direction
 * per DL6).
 *
 * Recursive at one level: also projects the nested `agentProfile`, `agent`
 * and (v0.12.0) `tenantBranding` blocks. Future additions to other nested
 * blocks follow the same pattern — extend `NESTED_KEYS` below.
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
// `tenantBranding` joined in v0.12.0 (SETTINGS-CASCADE C4, prompt 2242): the
// branding block gained logoUrl / primaryColor / accentColor, and every older
// pin's branding shape is `.strict()` with only terminology + teamRoleCopy.
// Before this the block rode to a spoke whole, so a new key would 400 it.
const NESTED_KEYS = ["agentProfile", "agent", "tenantBranding"];
function isNestedKey(key) {
    return NESTED_KEYS.includes(key);
}
function acceptsNull(fieldSchema) {
    const s = fieldSchema;
    return typeof s?.safeParse === "function" && s.safeParse(null).success;
}
function unwrapShape(schema) {
    const s = schema;
    return s?._def?.innerType?.shape ?? s?.shape ?? null;
}
const LICENSES_KEY = "licenses";
function isPlainObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
}
/**
 * v0.11.0: project `agent.licenses` one facet deeper. Each facet (`mlo`, `re`)
 * keeps only the keys the target's facet shape declares; a dropped key is
 * reported as `agent.licenses.<facet>.<key>`. A facet the target does not
 * declare at all is dropped whole and reported. When the target's licences
 * shape cannot be read, the value passes through unchanged (pre-v0.11.0
 * behaviour), never silently emptied.
 */
function projectLicences(value, licencesSchema, omittedFields) {
    const facetShapes = unwrapShape(licencesSchema);
    if (!facetShapes)
        return value;
    const out = {};
    for (const [facet, facetVal] of Object.entries(value)) {
        if (!(facet in facetShapes)) {
            omittedFields.push(`agent.${LICENSES_KEY}.${facet}`);
            continue;
        }
        const facetShape = unwrapShape(facetShapes[facet]);
        if (!facetShape || !isPlainObject(facetVal)) {
            out[facet] = facetVal;
            continue;
        }
        const projectedFacet = {};
        for (const [fKey, fVal] of Object.entries(facetVal)) {
            if (fKey in facetShape) {
                projectedFacet[fKey] = fVal;
            }
            else {
                omittedFields.push(`agent.${LICENSES_KEY}.${facet}.${fKey}`);
            }
        }
        out[facet] = projectedFacet;
    }
    return out;
}
export function projectPayloadForVersion(payload, targetVersion) {
    const resolvedVersion = targetVersion && targetVersion in VERSIONED_SCHEMAS
        ? targetVersion
        : BASELINE_SCHEMA_VERSION;
    const schema = VERSIONED_SCHEMAS[resolvedVersion];
    const rootShape = schema.shape;
    const rootKeys = new Set(Object.keys(rootShape));
    const omittedFields = [];
    const droppedNulls = [];
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
                        // v0.9.0 (D-349): `null` means CLEAR only to a receiver whose
                        // schema can parse it. For an older target the field is
                        // `.optional()` without `.nullable()` — a null would 400 its
                        // `.strict()` parse — so the key is dropped, which is exactly
                        // what such a spoke received before v0.9.0 (the producer omitted
                        // the key). Scoped to the `agent` block: agentProfile nulls are
                        // passed through unchanged, as they always were.
                        if (nVal === null && key === "agent" && !acceptsNull(nestedShape[nKey])) {
                            droppedNulls.push(`${key}.${nKey}`);
                            continue;
                        }
                        // v0.11.0 (brokerage identity): the licence facets gained keys two
                        // levels below the root. Project `agent.licenses.<facet>` against
                        // the target's own facet shape, so a spoke pinned below v0.11.0
                        // receives each facet with exactly the keys it declares.
                        if (key === "agent" && nKey === LICENSES_KEY && isPlainObject(nVal)) {
                            nestedProjected[nKey] = projectLicences(nVal, nestedShape[nKey], omittedFields);
                            continue;
                        }
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
    return { projected, omittedFields, droppedNulls, resolvedVersion };
}
//# sourceMappingURL=project-for-version.js.map