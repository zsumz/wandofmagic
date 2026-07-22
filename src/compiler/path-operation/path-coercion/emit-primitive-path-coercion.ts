import type { PathCoercionContext } from './emission-context.js';
import {
    coercionFailureLines,
    convertedAssignmentLines,
} from './emission-context.js';

export function emitBooleanPathCoercion(context: PathCoercionContext): readonly string[] {
    const { current, instruction, operationIndex } = context;
    const converted = `$converted${String(operationIndex)}`;
    const candidate = `$candidate${String(operationIndex)}`;
    const lines = [`        let ${converted} = ${current};`];
    lines.push(`        if (typeof ${current} !== "boolean") {`);
    lines.push(`            if (typeof ${current} !== "string") {`);
    lines.push(...coercionFailureLines(
        context,
        'Expected a boolean or boolean string.',
        '{ coercer: "boolean" }',
        16,
    ));
    lines.push('            }');
    const caseSensitive = instruction.coercer.kind === 'boolean'
        && instruction.coercer.caseSensitive;
    lines.push(
        `            const ${candidate} = ${caseSensitive ? current : `${current}.toLowerCase()`};`,
    );
    lines.push(`            if (${candidate} === "true") {`);
    lines.push(`                ${converted} = true;`);
    lines.push(`            } else if (${candidate} === "false") {`);
    lines.push(`                ${converted} = false;`);
    lines.push('            } else {');
    lines.push(...coercionFailureLines(
        context,
        'Expected the string "true" or "false".',
        '{ coercer: "boolean" }',
        16,
    ));
    lines.push('            }');
    lines.push('        }');
    lines.push(...convertedAssignmentLines(context, converted));
    return lines;
}

export function emitNumberPathCoercion(context: PathCoercionContext): readonly string[] {
    const { current, instruction, operationIndex } = context;
    const converted = `$converted${String(operationIndex)}`;
    const integer = instruction.coercer.kind === 'number' && instruction.coercer.integer;
    const name = integer ? 'integer' : 'number';
    const details = `{ coercer: "${name}" }`;
    const lines = [
        `        if (typeof ${current} !== "number" && typeof ${current} !== "string") {`,
        ...coercionFailureLines(context, 'Expected a number or decimal string.', details, 12),
        '        }',
        `        if (typeof ${current} === "string" && !$decimalNumber.test(${current}.trim())) {`,
        ...coercionFailureLines(context, 'Expected an explicit decimal number.', details, 12),
        '        }',
        `        const ${converted} = typeof ${current} === "number" ? ${current} : Number(${current});`,
        `        if (!Number.isFinite(${converted})) {`,
        ...coercionFailureLines(context, 'Expected a finite number.', details, 12),
        '        }',
    ];
    if (integer) {
        lines.push(`        if (!Number.isInteger(${converted})) {`);
        lines.push(...coercionFailureLines(context, 'Expected an integer.', details, 12));
        lines.push('        }');
    }
    lines.push(...convertedAssignmentLines(context, converted));
    return lines;
}

export function emitStringPathCoercion(context: PathCoercionContext): readonly string[] {
    const { current, operationIndex } = context;
    const converted = `$converted${String(operationIndex)}`;
    return [
        `        if (typeof ${current} !== "bigint" && typeof ${current} !== "boolean"`,
        `            && typeof ${current} !== "number" && typeof ${current} !== "string") {`,
        ...coercionFailureLines(
            context,
            'Expected a string-compatible primitive.',
            '{ coercer: "string" }',
            12,
        ),
        '        }',
        `        const ${converted} = String(${current});`,
        ...convertedAssignmentLines(context, converted),
    ];
}
