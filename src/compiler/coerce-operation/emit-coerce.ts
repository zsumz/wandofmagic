import type { CoerceInstruction } from '../../instructions/flat/flat-operation.js';
import type { EmitterState } from '../emitter/emitter-state.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { sourceString } from '../emitter/source-string.js';
import { emitPresentCoercion } from './emit-present-coercion.js';

export function emitCoerce(
    instruction: CoerceInstruction,
    operationIndex: number,
    state: EmitterState,
): string[] {
    const current = `$current${String(operationIndex)}`;
    const key = sourceString(instruction.key);
    const lines = [
        `        const ${current} = $hasOwn($value, ${key}) ? $value[${key}] : undefined;`,
    ];
    if (instruction.missing === 'error') {
        const failure = failureCallSource({
            code: 'missing_field',
            message: sourceString(
                `Cannot coerce ${instruction.key}; the field is missing or undefined.`,
            ),
            path: key,
            step: { id: sourceString(instruction.id), kind: 'coerce' },
        });
        lines.push(`        if (${current} === undefined) {`);
        lines.push(`            ${failure}`);
        lines.push('        }');
        lines.push(...emitPresentCoercion(instruction, operationIndex, state));
    } else {
        lines.push(`        if (${current} !== undefined) {`);
        lines.push(...emitPresentCoercion(instruction, operationIndex, state).map(
            (line) => `    ${line}`,
        ));
        lines.push('        }');
    }
    return lines;
}
