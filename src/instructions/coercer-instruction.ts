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

const builtinInstructions: WeakMap<object, BuiltinCoercerInstruction> = new WeakMap();

/** Associate a built-in coercer with an opcode without exposing metadata on the public object. */
export function registerBuiltinCoercer<Coercer extends object>(
    coercer: Coercer,
    instruction: BuiltinCoercerInstruction,
): Coercer {
    builtinInstructions.set(coercer, Object.freeze(instruction));
    return coercer;
}

/** Capture either a trusted built-in opcode or an opaque custom coercer binding. */
export function resolveCoercerInstruction(
    coercer: object,
    name: string,
    binding: unknown,
): CoercerInstruction {
    return builtinInstructions.get(coercer) ?? Object.freeze({ binding, kind: 'custom', name });
}
