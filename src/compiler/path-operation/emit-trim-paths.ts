import type { TrimPathsInstruction } from '../../instructions/path/path-operation.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { pathSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitTrimPaths(
    instruction: TrimPathsInstruction,
    operationIndex: number,
): readonly string[] {
    const suffix = String(operationIndex);
    const lines: string[] = [];
    for (let index = 0; index < instruction.paths.length; index += 1) {
        const path = instruction.paths[index];
        if (path === undefined) {
            continue;
        }
        const read = `$trimPathRead${suffix}_${String(index)}`;
        lines.push(`        const ${read} = $readPath($value, ${pathSource(path)});`);
        lines.push(`        if (${read}.status === "failed") {`);
        lines.push(
            `            $failIssue($WandError, ${read}.issue,`
            + ` ${sourceString(instruction.id)}, "trim");`,
        );
        lines.push('        }');
        lines.push(
            `        if (${read}.status === "found" && ${read}.value !== null`
            + ` && ${read}.value !== undefined && typeof ${read}.value !== "string") {`,
        );
        lines.push(`            ${failureCallSource({
            code: 'unexpected_type',
            message: sourceString(
                'Cannot trim the selected path; expected a string, null, or undefined.',
            ),
            path: pathSource(path),
            step: { id: sourceString(instruction.id), kind: 'trim' },
        })}`);
        lines.push('        }');
    }
    const staged = `$trimStaged${suffix}`;
    const changedPaths = `$trimChangedPaths${suffix}`;
    lines.push(`        let ${staged} = $value;`);
    lines.push(`        const ${changedPaths} = [];`);
    for (let index = 0; index < instruction.paths.length; index += 1) {
        const path = instruction.paths[index];
        if (path === undefined) {
            continue;
        }
        const read = `$trimPathRead${suffix}_${String(index)}`;
        const trimmed = `$pathTrimmed${suffix}_${String(index)}`;
        const write = `$trimPathWrite${suffix}_${String(index)}`;
        const pathLiteral = pathSource(path);
        lines.push(`        if (${read}.status === "found" && typeof ${read}.value === "string") {`);
        lines.push(`            const ${trimmed} = ${read}.value.trim();`);
        lines.push(`            if (${trimmed} !== ${read}.value) {`);
        lines.push(
            `                const ${write} = $setPath(`
            + `${staged}, ${pathLiteral}, ${trimmed}, $ownership);`,
        );
        lines.push(`                if (!${write}.ok) {`);
        lines.push(
            `                    $failIssue($WandError, ${write}.issue,`
            + ` ${sourceString(instruction.id)}, "trim");`,
        );
        lines.push('                }');
        lines.push(`                ${staged} = ${write}.value;`);
        lines.push(`                ${changedPaths}.push(${pathLiteral});`);
        lines.push('            }');
        lines.push('        }');
    }
    lines.push(`        if (${changedPaths}.length > 0) {`);
    lines.push(`            $commitRoots($value, ${staged}, ${changedPaths});`);
    lines.push('        }');
    return lines;
}
