import type { TransformInstruction } from '../../instructions/flat/flat-operation.js';
import { addBinding, type EmitterState } from '../emitter/emitter-state.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { sourceString } from '../emitter/source-string.js';

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
    const step = { id: sourceString(instruction.id), kind: 'transform' as const };
    const lines = [
        `        const ${current} = $hasOwn($value, ${key}) ? $value[${key}] : undefined;`,
        `        if (${current} === undefined) {`,
    ];
    if (instruction.missing === 'error') {
        lines.push(`            ${failureCallSource({
            code: 'missing_field',
            message: sourceString(
                `Cannot transform ${instruction.key}; the field is missing or undefined.`,
            ),
            path: key,
            step,
        })}`);
    }
    lines.push('        } else {');
    lines.push(`            let ${transformed};`);
    lines.push(`            let ${promiseLike} = false;`);
    lines.push('            try {');
    lines.push(`                ${transformed} = ${binding}(${current});`);
    lines.push(`                ${promiseLike} = $isPromiseLike(${transformed});`);
    lines.push('            } catch ($cause) {');
    lines.push(`                ${failureCallSource({
        cause: '$cause',
        code: 'transform_failed',
        message: sourceString(`The transform for ${instruction.key} threw an error.`),
        path: key,
        step,
    })}`);
    lines.push('            }');
    lines.push(`            if (${promiseLike}) {`);
    lines.push(`                ${failureCallSource({
        code: 'transform_failed',
        message: sourceString(
            `The transform for ${instruction.key} returned a promise in the synchronous core.`,
        ),
        path: key,
        step,
    })}`);
    lines.push('            }');
    lines.push(`            if (!Object.is(${current}, ${transformed})) {`);
    lines.push(`                $value[${key}] = ${transformed};`);
    lines.push('            }');
    lines.push('        }');
    return lines;
}
