import type {
    DefaultInstruction,
    DeriveInstruction,
    TransformInstruction,
    TrimInstruction,
} from '../instructions/flat-operation.js';
import { addBinding, type EmitterState } from './emitter-state.js';
import { sourceString } from './source-string.js';

export function emitTrim(instruction: TrimInstruction, operationIndex: number): string[] {
    const lines: string[] = [];
    for (let index = 0; index < instruction.keys.length; index += 1) {
        const key = instruction.keys[index];
        if (key === undefined) {
            continue;
        }
        const variable = `$current${String(operationIndex)}_${String(index)}`;
        lines.push(`        const ${variable} = $hasOwn($value, ${sourceString(key)}) ? $value[${sourceString(key)}] : undefined;`);
        lines.push(`        if (${variable} !== null && ${variable} !== undefined && typeof ${variable} !== "string") {`);
        lines.push(`            $fail($WandError, "unexpected_type", ${sourceString(`Cannot trim ${key}; expected a string, null, or undefined.`)}, ${sourceString(key)}, ${sourceString(instruction.id)}, "trim");`);
        lines.push('        }');
    }
    for (let index = 0; index < instruction.keys.length; index += 1) {
        const key = instruction.keys[index];
        if (key === undefined) {
            continue;
        }
        const variable = `$current${String(operationIndex)}_${String(index)}`;
        lines.push(`        if (typeof ${variable} === "string") {`);
        lines.push(`            const $trimmed${String(operationIndex)}_${String(index)} = ${variable}.trim();`);
        lines.push(`            if ($trimmed${String(operationIndex)}_${String(index)} !== ${variable}) {`);
        lines.push(`                $value[${sourceString(key)}] = $trimmed${String(operationIndex)}_${String(index)};`);
        lines.push('            }');
        lines.push('        }');
    }
    return lines;
}

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

export function emitTransform(
    instruction: TransformInstruction,
    operationIndex: number,
    state: EmitterState,
): string[] {
    const binding = addBinding(state, instruction.binding, 'transform', instruction.id);
    const current = `$current${String(operationIndex)}`;
    const transformed = `$transformed${String(operationIndex)}`;
    const promiseLike = `$promiseLike${String(operationIndex)}`;
    const key = sourceString(instruction.key);
    const lines = [
        `        const ${current} = $hasOwn($value, ${key}) ? $value[${key}] : undefined;`,
        `        if (${current} === undefined) {`,
    ];
    if (instruction.missing === 'error') {
        lines.push(`            $fail($WandError, "missing_field", ${sourceString(`Cannot transform ${instruction.key}; the field is missing or undefined.`)}, ${key}, ${sourceString(instruction.id)}, "transform");`);
    }
    lines.push('        } else {');
    lines.push(`            let ${transformed};`);
    lines.push(`            let ${promiseLike} = false;`);
    lines.push('            try {');
    lines.push(`                ${transformed} = ${binding}(${current});`);
    lines.push(`                ${promiseLike} = $isPromiseLike(${transformed});`);
    lines.push('            } catch ($cause) {');
    lines.push(`                $fail($WandError, "transform_failed", ${sourceString(`The transform for ${instruction.key} threw an error.`)}, ${key}, ${sourceString(instruction.id)}, "transform", undefined, $cause);`);
    lines.push('            }');
    lines.push(`            if (${promiseLike}) {`);
    lines.push(`                $fail($WandError, "transform_failed", ${sourceString(`The transform for ${instruction.key} returned a promise in the synchronous core.`)}, ${key}, ${sourceString(instruction.id)}, "transform");`);
    lines.push('            }');
    lines.push(`            if (!Object.is(${current}, ${transformed})) {`);
    lines.push(`                $value[${key}] = ${transformed};`);
    lines.push('            }');
    lines.push('        }');
    return lines;
}

export function emitDerive(
    instruction: DeriveInstruction,
    operationIndex: number,
    state: EmitterState,
): string[] {
    const binding = addBinding(state, instruction.binding, 'derive', instruction.id);
    const inputs = `$inputs${String(operationIndex)}`;
    const derived = `$derived${String(operationIndex)}`;
    const promiseLike = `$promiseLike${String(operationIndex)}`;
    const key = sourceString(instruction.key);
    const lines = [
        `        if ($hasOwn($value, ${key})) {`,
        `            $fail($WandError, "destination_conflict", ${sourceString(`Cannot derive ${instruction.key}; the destination already exists.`)}, ${key}, ${sourceString(instruction.id)}, "derive");`,
        '        }',
        `        const ${inputs} = new Array(${String(instruction.dependencies.length)});`,
    ];
    for (let index = 0; index < instruction.dependencies.length; index += 1) {
        const dependency = instruction.dependencies[index];
        if (dependency === undefined) {
            continue;
        }
        const dependencyKey = sourceString(dependency);
        const current = `$dependency${String(operationIndex)}_${String(index)}`;
        lines.push(`        const ${current} = $hasOwn($value, ${dependencyKey}) ? $value[${dependencyKey}] : undefined;`);
        lines.push(`        if (${current} === undefined) {`);
        lines.push(`            $fail($WandError, "missing_field", ${sourceString(`Cannot derive ${instruction.key}; ${dependency} is missing or undefined.`)}, ${dependencyKey}, ${sourceString(instruction.id)}, "derive");`);
        lines.push('        }');
        lines.push(`        ${inputs}[${String(index)}] = ${current};`);
    }
    lines.push(`        let ${derived};`);
    lines.push(`        let ${promiseLike} = false;`);
    lines.push('        try {');
    lines.push(`            ${derived} = ${binding}(${inputs});`);
    lines.push(`            ${promiseLike} = $isPromiseLike(${derived});`);
    lines.push('        } catch ($cause) {');
    lines.push(`            $fail($WandError, "transform_failed", ${sourceString(`The derive callback for ${instruction.key} threw an error.`)}, ${key}, ${sourceString(instruction.id)}, "derive", undefined, $cause);`);
    lines.push('        }');
    lines.push(`        if (${promiseLike}) {`);
    lines.push(`            $fail($WandError, "transform_failed", ${sourceString(`The derive callback for ${instruction.key} returned a promise in the synchronous core.`)}, ${key}, ${sourceString(instruction.id)}, "derive");`);
    lines.push('        }');
    lines.push(`        $value[${key}] = ${derived};`);
    return lines;
}
