export type BuiltinCoercerInstruction =
    | {
        readonly caseSensitive: boolean;
        readonly kind: 'boolean';
    }
    | {
        readonly integer: boolean;
        readonly kind: 'number';
    }
    | { readonly kind: 'iso-date' }
    | { readonly kind: 'string' };

export interface CustomCoercerInstruction {
    readonly binding: unknown;
    readonly kind: 'custom';
    readonly name: string;
}

export type CoercerInstruction = BuiltinCoercerInstruction | CustomCoercerInstruction;
