export type MapperBindingKind = 'coercer' | 'default' | 'derive' | 'transform';

export interface MapperBindingDescription {
    readonly index: number;
    readonly kind: MapperBindingKind;
    readonly stepId: string;
}

/** Auditable mapper source plus opaque values that generated code receives explicitly. */
export interface TrustedMapperModule {
    readonly bindingDescriptions: readonly MapperBindingDescription[];
    readonly bindings: readonly unknown[];
    readonly mode: 'trusted-discard';
    readonly source: string;
}
