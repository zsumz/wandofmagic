import type { CoerceInstruction } from '../instructions/flat-operation.js';
import {
    emitBooleanCoercion,
    emitConvertedAssignment,
    emitNumberCoercion,
    emitStringCoercion,
} from './emit-builtin-coercer.js';
import { addBinding, type EmitterState } from './emitter-state.js';
import { sourceString } from './source-string.js';

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
        lines.push(`        if (${current} === undefined) {`);
        lines.push(`            $fail($WandError, "missing_field", ${sourceString(`Cannot coerce ${instruction.key}; the field is missing or undefined.`)}, ${key}, ${sourceString(instruction.id)}, "coerce");`);
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

function emitPresentCoercion(
    instruction: CoerceInstruction,
    operationIndex: number,
    state: EmitterState,
): string[] {
    switch (instruction.coercer.kind) {
        case 'boolean':
            return emitBooleanCoercion(instruction, operationIndex);
        case 'number':
            return emitNumberCoercion(instruction, operationIndex);
        case 'string':
            return emitStringCoercion(instruction, operationIndex);
        case 'custom': {
            const binding = addBinding(
                state,
                instruction.coercer.binding,
                'coercer',
                instruction.id,
            );
            return emitResultCoercer(
                instruction,
                operationIndex,
                `${binding}($current${String(operationIndex)})`,
                instruction.coercer.name,
            );
        }
        case 'iso-date':
            return emitResultCoercer(
                instruction,
                operationIndex,
                `$coerceIsoDate($current${String(operationIndex)})`,
                'iso-date',
            );
    }
}

function emitResultCoercer(
    instruction: CoerceInstruction,
    operationIndex: number,
    invocation: string,
    name: string,
): string[] {
    const converted = `$converted${String(operationIndex)}`;
    const current = `$current${String(operationIndex)}`;
    const details = `{ coercer: ${sourceString(name)} }`;
    return [
        `        let ${converted};`,
        '        try {',
        `            ${converted} = ${invocation};`,
        '        } catch ($cause) {',
        `            $fail($WandError, "coercion_failed", ${sourceString(`The ${name} coercer threw while processing ${instruction.key}.`)}, ${sourceString(instruction.key)}, ${sourceString(instruction.id)}, "coerce", ${details}, $cause);`,
        '        }',
        `        if (!${converted}.ok) {`,
        `            const $details${String(operationIndex)} = ${converted}.code === undefined`,
        `                ? ${details}`,
        `                : { coercerCode: ${converted}.code, coercer: ${sourceString(name)} };`,
        `            $fail($WandError, "coercion_failed", ${converted}.message, ${sourceString(instruction.key)}, ${sourceString(instruction.id)}, "coerce", $details${String(operationIndex)});`,
        '        }',
        ...emitConvertedAssignment(instruction.key, current, `${converted}.value`),
    ];
}
