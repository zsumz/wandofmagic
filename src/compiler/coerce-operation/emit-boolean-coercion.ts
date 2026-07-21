import type { CoerceInstruction } from '../../instructions/flat/flat-operation.js';
import { emitCoercionFailure } from './emit-coercion-failure.js';
import { emitConvertedAssignment } from './emit-converted-assignment.js';

export function emitBooleanCoercion(
    instruction: CoerceInstruction,
    operationIndex: number,
): string[] {
    const current = `$current${String(operationIndex)}`;
    const converted = `$converted${String(operationIndex)}`;
    const candidate = `$candidate${String(operationIndex)}`;
    const details = '{ coercer: "boolean" }';
    const lines = [`        let ${converted} = ${current};`];
    lines.push(`        if (typeof ${current} !== "boolean") {`);
    lines.push(`            if (typeof ${current} !== "string") {`);
    lines.push(...emitCoercionFailure(
        instruction,
        'Expected a boolean or boolean string.',
        details,
        16,
    ));
    lines.push('            }');
    const caseSensitive = instruction.coercer.kind === 'boolean'
        && instruction.coercer.caseSensitive;
    lines.push(`            const ${candidate} = ${caseSensitive ? current : `${current}.toLowerCase()`};`);
    lines.push(`            if (${candidate} === "true") {`);
    lines.push(`                ${converted} = true;`);
    lines.push(`            } else if (${candidate} === "false") {`);
    lines.push(`                ${converted} = false;`);
    lines.push('            } else {');
    lines.push(...emitCoercionFailure(
        instruction,
        'Expected the string "true" or "false".',
        details,
        12,
    ));
    lines.push('            }');
    lines.push('        }');
    lines.push(...emitConvertedAssignment(instruction.key, current, converted));
    return lines;
}
