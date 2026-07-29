export type MapperBindingKind = 'coercer' | 'default' | 'derive' | 'set' | 'transform';

/** Current schema version for trusted mapper artifacts. */
export const TRUSTED_MAPPER_FORMAT_VERSION = 1;

/** Describes one opaque value required by the generated mapper factory. */
export interface MapperBindingDescription {
    /** Zero-based position in {@link TrustedMapperModule.bindings}. */
    readonly index: number;
    /** Runtime role of the binding. */
    readonly kind: MapperBindingKind;
    /** Stable identifier of the spell step that owns the binding. */
    readonly stepId: string;
}

/** Auditable mapper source plus opaque values that generated code receives explicitly. */
export interface TrustedMapperModule {
    /** Metadata for each opaque runtime binding, in binding order. */
    readonly bindingDescriptions: readonly MapperBindingDescription[];
    /** Opaque runtime values passed explicitly to the generated factory. */
    readonly bindings: readonly unknown[];
    /** Artifact schema version. Reject versions a consumer does not support. */
    readonly formatVersion: typeof TRUSTED_MAPPER_FORMAT_VERSION;
    /** Execution policy compiled into this artifact. */
    readonly mode: 'trusted-discard';
    /** Deterministic ESM source exporting `createTrustedMapper`. */
    readonly source: string;
}
