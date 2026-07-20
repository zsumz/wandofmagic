import type { CoerceInstruction } from '../instructions/flat-operation.js';
import { sourceString } from './source-string.js';

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
    lines.push(...failureLines(
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
    lines.push(...failureLines(
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
        ...failureLines(instruction, 'Expected a number or decimal string.', details, 12),
        '        }',
        `        if (typeof ${current} === "string" && !$decimalNumber.test(${current}.trim())) {`,
        ...failureLines(instruction, 'Expected an explicit decimal number.', details, 12),
        '        }',
        `        const ${converted} = typeof ${current} === "number" ? ${current} : Number(${current});`,
        `        if (!Number.isFinite(${converted})) {`,
        ...failureLines(instruction, 'Expected a finite number.', details, 12),
        '        }',
    ];
    if (integer) {
        lines.push(`        if (!Number.isInteger(${converted})) {`);
        lines.push(...failureLines(instruction, 'Expected an integer.', details, 12));
        lines.push('        }');
    }
    lines.push(...emitConvertedAssignment(instruction.key, current, converted));
    return lines;
}

export function emitStringCoercion(
    instruction: CoerceInstruction,
    operationIndex: number,
): string[] {
    const current = `$current${String(operationIndex)}`;
    const converted = `$converted${String(operationIndex)}`;
    return [
        `        if (typeof ${current} !== "bigint" && typeof ${current} !== "boolean"`,
        `            && typeof ${current} !== "number" && typeof ${current} !== "string") {`,
        ...failureLines(
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

export function emitConvertedAssignment(
    key: string,
    current: string,
    converted: string,
): string[] {
    return [
        `        if (!Object.is(${current}, ${converted})) {`,
        `            $value[${sourceString(key)}] = ${converted};`,
        '        }',
    ];
}

function failureLines(
    instruction: CoerceInstruction,
    message: string,
    details: string,
    spaces: number,
): string[] {
    const indent = ' '.repeat(spaces);
    return [`${indent}$fail($WandError, "coercion_failed", ${sourceString(message)}, ${sourceString(instruction.key)}, ${sourceString(instruction.id)}, "coerce", ${details});`];
}
