import { VERSIONED_SCHEMAS, BASELINE_SCHEMA_VERSION, type SupportedSchemaVersion } from "./payload.js";

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
const NESTED_KEYS = ["agentProfile"] as const;
type NestedKey = typeof NESTED_KEYS[number];

function isNestedKey(key: string): key is NestedKey {
  return (NESTED_KEYS as readonly string[]).includes(key);
}

interface OptionalSchemaShape {
  _def?: { innerType?: { shape?: Record<string, unknown> } };
  shape?: Record<string, unknown>;
}

function unwrapShape(schema: unknown): Record<string, unknown> | null {
  const s = schema as OptionalSchemaShape;
  return s?._def?.innerType?.shape ?? s?.shape ?? null;
}

export function projectPayloadForVersion(
  payload: Record<string, unknown>,
  targetVersion: string | null | undefined,
): {
  projected: Record<string, unknown>;
  omittedFields: string[];
  resolvedVersion: SupportedSchemaVersion;
} {
  const resolvedVersion: SupportedSchemaVersion =
    targetVersion && targetVersion in VERSIONED_SCHEMAS
      ? (targetVersion as SupportedSchemaVersion)
      : BASELINE_SCHEMA_VERSION;

  const schema = VERSIONED_SCHEMAS[resolvedVersion];
  const rootShape = schema.shape as Record<string, unknown>;
  const rootKeys = new Set(Object.keys(rootShape));
  const omittedFields: string[] = [];
  const projected: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (!rootKeys.has(key)) {
      omittedFields.push(key);
      continue;
    }

    if (isNestedKey(key) && value && typeof value === "object" && !Array.isArray(value)) {
      const nestedShape = unwrapShape(rootShape[key]);
      if (nestedShape) {
        const nestedKeys = new Set(Object.keys(nestedShape));
        const nestedProjected: Record<string, unknown> = {};
        for (const [nKey, nVal] of Object.entries(value as Record<string, unknown>)) {
          if (nestedKeys.has(nKey)) {
            nestedProjected[nKey] = nVal;
          } else {
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
