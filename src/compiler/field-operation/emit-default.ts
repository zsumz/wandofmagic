import type { DefaultInstruction } from '../../instructions/flat/flat-operation.js';
import { addBinding, type EmitterState } from '../emitter/emitter-state.js';
import { sourceString } from '../emitter/source-string.js';

export function emitDefault(
    instruction: DefaultInstruction,
    state: EmitterState,
): string[] {
    const binding = addBinding(state, instruction.fallback, 'default', instruction.id);
    const key = sourceString(instruction.key);
    return [
        `        if (!$hasOwn($value, ${key}) || $value[${key}] === undefined) {`,
        `            $value[${key}] = ${binding};`,
        '        }',
    ];
}
