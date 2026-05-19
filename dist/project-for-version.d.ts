import { type SupportedSchemaVersion } from "./payload.js";
export declare function projectPayloadForVersion(payload: Record<string, unknown>, targetVersion: string | null | undefined): {
    projected: Record<string, unknown>;
    omittedFields: string[];
    resolvedVersion: SupportedSchemaVersion;
};
//# sourceMappingURL=project-for-version.d.ts.map