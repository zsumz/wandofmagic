import type { DerivePathInstruction } from '../../instructions/path/path-operation.js';
import { addBinding, type EmitterState } from '../emitter/emitter-state.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { pathSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitDerivePath(
    instruction: DerivePathInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    const binding = addBinding(state, instruction.binding, 'derive', instruction.id);
    const suffix = String(operationIndex);
    const destination = pathSource(instruction.destination, state);
    const destinationRead = `$deriveDestination${suffix}`;
    const inputs = `$pathInputs${suffix}`;
    const derived = `$pathDerived${suffix}`;
    const promise = `$pathDerivePromise${suffix}`;
    const write = `$deriveWrite${suffix}`;
    const step = { id: sourceString(instruction.id), kind: 'derive' as const };
    const lines = [
        `        const ${destinationRead} = $readPath($value, ${destination});`,
        `        if (${destinationRead}.status === "failed") {`,
        `            $failIssue($WandError, ${destinationRead}.issue, ${step.id}, "derive");`,
        '        }',
        `        if (${destinationRead}.status === "found") {`,
        `            ${failureCallSource({
            code: 'destination_conflict',
            message: sourceString('Cannot derive the selected path; its destination already exists.'),
            path: destination,
            step,
        })}`,
        '        }',
        `        const ${inputs} = new Array(${String(instruction.dependencies.length)});`,
    ];
    for (let index = 0; index < instruction.dependencies.length; index += 1) {
        const dependency = instruction.dependencies[index];
        if (dependency === undefined) {
            continue;
        }
        const dependencyPath = pathSource(dependency, state);
        const read = `$deriveDependency${suffix}_${String(index)}`;
        lines.push(`        const ${read} = $readPath($value, ${dependencyPath});`);
        lines.push(`        if (${read}.status === "failed") {`);
        lines.push(`            $failIssue($WandError, ${read}.issue, ${step.id}, "derive");`);
        lines.push('        }');
        lines.push(`        if (${read}.status === "missing" || ${read}.value === undefined) {`);
        lines.push(`            ${failureCallSource({
            code: 'missing_field',
            message: sourceString(
                'Cannot derive the selected path; a dependency is missing or undefined.',
            ),
            path: dependencyPath,
            step,
        })}`);
        lines.push('        }');
        lines.push(`        ${inputs}[${String(index)}] = ${read}.value;`);
    }
    lines.push(`        let ${derived};`);
    lines.push(`        let ${promise} = false;`);
    lines.push('        try {');
    lines.push(`            ${derived} = ${binding}(${inputs});`);
    lines.push(`            ${promise} = $isPromiseLike(${derived});`);
    lines.push('        } catch ($cause) {');
    lines.push(`            ${failureCallSource({
        cause: '$cause',
        code: 'transform_failed',
        message: sourceString('The derive callback for the selected path threw an error.'),
        path: destination,
        step,
    })}`);
    lines.push('        }');
    lines.push(`        if (${promise}) {`);
    lines.push(`            ${failureCallSource({
        code: 'transform_failed',
        message: sourceString('The derive callback for the selected path returned a promise.'),
        path: destination,
        step,
    })}`);
    lines.push('        }');
    lines.push(
        `        const ${write} = $commitSet(`
        + `$value, ${destination}, ${derived}, $ownership);`,
    );
    lines.push(`        if (!${write}.ok) {`);
    lines.push(`            $failIssue($WandError, ${write}.issue, ${step.id}, "derive");`);
    lines.push('        }');
    return lines;
}
