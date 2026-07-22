import type { OmitPathsInstruction } from '../../instructions/path/path-operation.js';
import type { EmitterState } from '../emitter/emitter-state.js';
import { pathSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitOmitPaths(
    instruction: OmitPathsInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    const suffix = String(operationIndex);
    const staged = `$omitStaged${suffix}`;
    const changed = `$omitChanged${suffix}`;
    const lines = [
        `        let ${staged} = $value;`,
        `        const ${changed} = [];`,
    ];
    for (let index = 0; index < instruction.paths.length; index += 1) {
        const path = instruction.paths[index];
        if (path === undefined) {
            continue;
        }
        const literal = pathSource(path, state);
        const result = `$omitResult${suffix}_${String(index)}`;
        lines.push(
            `        const ${result} = $deletePath(`
            + `${staged}, ${literal}, $ownership);`,
        );
        lines.push(`        if (!${result}.ok) {`);
        lines.push(
            `            $failIssue($WandError, ${result}.issue,`
            + ` ${sourceString(instruction.id)}, "omit");`,
        );
        lines.push('        }');
        lines.push(`        if (${result}.changed) {`);
        lines.push(`            ${staged} = ${result}.value;`);
        lines.push(`            ${changed}.push(${literal});`);
        lines.push('        }');
    }
    lines.push(`        if (${changed}.length > 0) {`);
    lines.push(`            $commitRoots($value, ${staged}, ${changed});`);
    lines.push('        }');
    return lines;
}
