import type { OmitPathsInstruction } from '../../instructions/path/path-operation.js';
import type { EmitterState } from '../emitter/emitter-state.js';
import { pathSource, readPathSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitOmitPaths(
    instruction: OmitPathsInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    const suffix = String(operationIndex);
    const lines: string[] = [];
    for (let index = 0; index < instruction.paths.length; index += 1) {
        const path = instruction.paths[index];
        if (path === undefined) {
            continue;
        }
        const literal = pathSource(path, state);
        const read = `$omitRead${suffix}_${String(index)}`;
        const result = `$omitResult${suffix}_${String(index)}`;
        lines.push(`        const ${read} = ${readPathSource('$value', path, state)};`);
        lines.push(`        if (${read}.status === "failed") {`);
        lines.push(
            `            $failIssue($WandError, ${read}.issue,`
            + ` ${sourceString(instruction.id)}, "omit");`,
        );
        lines.push('        }');
        lines.push(`        if (${read}.status === "found") {`);
        lines.push(
            `            const ${result} = $deleteRead(`
            + `$value, ${literal}, ${read}, $ownership);`,
        );
        lines.push(`            if (!${result}.ok) {`);
        lines.push(
            `                $failIssue($WandError, ${result}.issue,`
            + ` ${sourceString(instruction.id)}, "omit");`,
        );
        lines.push('            }');
        lines.push('        }');
    }
    return lines;
}
