export type MapperBindingKind = 'coercer' | 'default' | 'derive' | 'transform';

export interface MapperBindingDescription {
    readonly index: number;
    readonly kind: MapperBindingKind;
    readonly stepId: string;
}

/** Auditable source plus the opaque values that generated code must receive explicitly. */
export interface TrustedMapperModule {
    readonly bindingDescriptions: readonly MapperBindingDescription[];
    readonly bindings: readonly unknown[];
    readonly mode: 'trusted-discard';
    readonly source: string;
}
