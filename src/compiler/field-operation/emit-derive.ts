import type { DeriveInstruction } from '../../instructions/flat/flat-operation.js';
import { addBinding, type EmitterState } from '../emitter/emitter-state.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { sourceString } from '../emitter/source-string.js';

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
    const step = { id: sourceString(instruction.id), kind: 'derive' as const };
    const conflictFailure = failureCallSource({
        code: 'destination_conflict',
        message: sourceString(
            `Cannot derive ${instruction.key}; the destination already exists.`,
        ),
        path: key,
        step,
    });
    const lines = [
        `        if ($hasOwn($value, ${key})) {`,
        `            ${conflictFailure}`,
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
        const missingFailure = failureCallSource({
            code: 'missing_field',
            message: sourceString(
                `Cannot derive ${instruction.key}; ${dependency} is missing or undefined.`,
            ),
            path: dependencyKey,
            step,
        });
        lines.push(
            `        const ${current} = $hasOwn($value, ${dependencyKey})`
            + ` ? $value[${dependencyKey}] : undefined;`,
        );
        lines.push(`        if (${current} === undefined) {`);
        lines.push(`            ${missingFailure}`);
        lines.push('        }');
        lines.push(`        ${inputs}[${String(index)}] = ${current};`);
    }
    lines.push(`        let ${derived};`);
    lines.push(`        let ${promiseLike} = false;`);
    lines.push('        try {');
    lines.push(`            ${derived} = ${binding}(${inputs});`);
    lines.push(`            ${promiseLike} = $isPromiseLike(${derived});`);
    lines.push('        } catch ($cause) {');
    lines.push(`            ${failureCallSource({
        cause: '$cause',
        code: 'transform_failed',
        message: sourceString(`The derive callback for ${instruction.key} threw an error.`),
        path: key,
        step,
    })}`);
    lines.push('        }');
    lines.push(`        if (${promiseLike}) {`);
    lines.push(`            ${failureCallSource({
        code: 'transform_failed',
        message: sourceString(
            `The derive callback for ${instruction.key} returned a promise in the synchronous core.`,
        ),
        path: key,
        step,
    })}`);
    lines.push('        }');
    lines.push(`        $value[${key}] = ${derived};`);
    return lines;
}
