import type { CoerceInstruction } from '../../instructions/flat/flat-operation.js';
import { emitCoercionFailure } from './emit-coercion-failure.js';
import { emitConvertedAssignment } from './emit-converted-assignment.js';

export function emitStringCoercion(
    instruction: CoerceInstruction,
    operationIndex: number,
): string[] {
    const current = `$current${String(operationIndex)}`;
    const converted = `$converted${String(operationIndex)}`;
    return [
        `        if (typeof ${current} !== "bigint" && typeof ${current} !== "boolean"`,
        `            && typeof ${current} !== "number" && typeof ${current} !== "string") {`,
        ...emitCoercionFailure(
            instruction,
            'Expected a string-compatible primitive.',
            '{ coercer: "string" }',
            12,
        ),
        '        }',
        `        const ${converted} = String(${current});`,
        ...emitConvertedAssignment(instruction.key, current, converted),
    ];
}
