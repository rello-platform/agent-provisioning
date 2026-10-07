import { type SupportedSchemaVersion } from "./payload.js";
export declare function projectPayloadForVersion(payload: Record<string, unknown>, targetVersion: string | null | undefined): {
    projected: Record<string, unknown>;
    omittedFields: string[];
    /**
     * v0.9.0 (D-349): `agent.<key>` entries whose value was `null` and whose
     * target-version field schema does not accept null — dropped, so a spoke
     * pinned < v0.9.0 receives the key omitted exactly as before v0.9.0.
     */
    droppedNulls: string[];
    resolvedVersion: SupportedSchemaVersion;
};
//# sourceMappingURL=project-for-version.d.ts.map