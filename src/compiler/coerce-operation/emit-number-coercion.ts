import type { CoerceInstruction } from '../../instructions/flat/flat-operation.js';
import { sourceString } from '../emitter/source-string.js';
import { emitCoercionFailure } from './emit-coercion-failure.js';
import { emitConvertedAssignment } from './emit-converted-assignment.js';

export function emitNumberCoercion(
    instruction: CoerceInstruction,
    operationIndex: number,
): string[] {
    const current = `$current${String(operationIndex)}`;
    const converted = `$converted${String(operationIndex)}`;
    const integer = instruction.coercer.kind === 'number' && instruction.coercer.integer;
    const name = integer ? 'integer' : 'number';
    const details = `{ coercer: ${sourceString(name)} }`;
    const lines = [
        `        if (typeof ${current} !== "number" && typeof ${current} !== "string") {`,
        ...emitCoercionFailure(instruction, 'Expected a number or decimal string.', details, 12),
        '        }',
        `        if (typeof ${current} === "string" && !$decimalNumber.test(${current}.trim())) {`,
        ...emitCoercionFailure(instruction, 'Expected an explicit decimal number.', details, 12),
        '        }',
        `        const ${converted} = typeof ${current} === "number" ? ${current} : Number(${current});`,
        `        if (!Number.isFinite(${converted})) {`,
        ...emitCoercionFailure(instruction, 'Expected a finite number.', details, 12),
        '        }',
    ];
    if (integer) {
        lines.push(`        if (!Number.isInteger(${converted})) {`);
        lines.push(...emitCoercionFailure(instruction, 'Expected an integer.', details, 12));
        lines.push('        }');
    }
    lines.push(...emitConvertedAssignment(instruction.key, current, converted));
    return lines;
}
