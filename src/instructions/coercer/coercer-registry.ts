import type {
    BuiltinCoercerInstruction,
    CoercerInstruction,
} from './coercer-instruction.js';

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
