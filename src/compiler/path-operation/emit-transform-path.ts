import type { TransformPathInstruction } from '../../instructions/path/path-operation.js';
import { addBinding, type EmitterState } from '../emitter/emitter-state.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { pathSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitTransformPath(
    instruction: TransformPathInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    const binding = addBinding(state, instruction.binding, 'transform', instruction.id);
    const suffix = String(operationIndex);
    const path = pathSource(instruction.path, state);
    const read = `$transformRead${suffix}`;
    const transformed = `$pathTransformed${suffix}`;
    const promise = `$pathPromise${suffix}`;
    const write = `$transformWrite${suffix}`;
    const step = { id: sourceString(instruction.id), kind: 'transform' as const };
    const lines = [
        `        const ${read} = $readPath($value, ${path});`,
        `        if (${read}.status === "failed") {`,
        `            $failIssue($WandError, ${read}.issue, ${step.id}, "transform");`,
        '        }',
        `        if (${read}.status === "missing" || ${read}.value === undefined) {`,
    ];
    if (instruction.missing === 'error') {
        lines.push(`            ${failureCallSource({
            code: 'missing_field',
            message: sourceString('Cannot transform the selected path; it is missing or undefined.'),
            path,
            step,
        })}`);
    }
    lines.push('        } else {');
    lines.push(`            let ${transformed};`);
    lines.push(`            let ${promise} = false;`);
    lines.push('            try {');
    lines.push(`                ${transformed} = ${binding}(${read}.value);`);
    lines.push(`                ${promise} = $isPromiseLike(${transformed});`);
    lines.push('            } catch ($cause) {');
    lines.push(`                ${failureCallSource({
        cause: '$cause',
        code: 'transform_failed',
        message: sourceString('The transform for the selected path threw an error.'),
        path,
        step,
    })}`);
    lines.push('            }');
    lines.push(`            if (${promise}) {`);
    lines.push(`                ${failureCallSource({
        code: 'transform_failed',
        message: sourceString('The transform for the selected path returned a promise.'),
        path,
        step,
    })}`);
    lines.push('            }');
    lines.push(`            if (!Object.is(${read}.value, ${transformed})) {`);
    lines.push(
        `                const ${write} = $commitSet(`
        + `$value, ${path}, ${transformed}, $ownership);`,
    );
    lines.push(`                if (!${write}.ok) {`);
    lines.push(`                    $failIssue($WandError, ${write}.issue, ${step.id}, "transform");`);
    lines.push('                }');
    lines.push('            }');
    lines.push('        }');
    return lines;
}
