import type { TrimPathsInstruction } from '../../instructions/path/path-operation.js';
import type { EmitterState } from '../emitter/emitter-state.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { pathSource, readPathSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitTrimPaths(
    instruction: TrimPathsInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    const suffix = String(operationIndex);
    const parentGroups = groupPathParents(instruction.paths);
    const lines: string[] = parentGroups.map((_, index) =>
        `        let $trimParent${suffix}_${String(index)};`);
    for (let index = 0; index < instruction.paths.length; index += 1) {
        const path = instruction.paths[index];
        if (path === undefined) {
            continue;
        }
        const read = `$trimPathRead${suffix}_${String(index)}`;
        lines.push(`        const ${read} = ${readPathSource('$value', path, state)};`);
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
            path: pathSource(path, state),
            step: { id: sourceString(instruction.id), kind: 'trim' },
        })}`);
        lines.push('        }');
    }
    for (let index = 0; index < instruction.paths.length; index += 1) {
        const path = instruction.paths[index];
        if (path === undefined) {
            continue;
        }
        const read = `$trimPathRead${suffix}_${String(index)}`;
        const trimmed = `$pathTrimmed${suffix}_${String(index)}`;
        const write = `$trimPathWrite${suffix}_${String(index)}`;
        const pathLiteral = pathSource(path, state);
        const parentIndex = parentGroups.findIndex((parent) => sameParent(parent, path));
        const parent = parentIndex < 0
            ? undefined
            : `$trimParent${suffix}_${String(parentIndex)}`;
        const writeIndent = parent === undefined ? '                ' : '                    ';
        const failureIndent = `${writeIndent}    `;
        lines.push(`        if (${read}.status === "found" && typeof ${read}.value === "string") {`);
        lines.push(`            const ${trimmed} = ${read}.value.trim();`);
        lines.push(`            if (${trimmed} !== ${read}.value) {`);
        if (parent !== undefined) {
            lines.push(`                if (${parent} === undefined) {`);
        }
        lines.push(
            `${writeIndent}const ${write} = $commitRead(`
            + `$value, ${pathLiteral}, ${read}, ${trimmed}, $ownership, true);`,
        );
        lines.push(`${writeIndent}if (!${write}.ok) {`);
        lines.push(
            `${failureIndent}$failIssue($WandError, ${write}.issue,`
            + ` ${sourceString(instruction.id)}, "trim");`,
        );
        lines.push(`${writeIndent}}`);
        if (parent !== undefined) {
            lines.push(`                    ${parent} = ${write}.container;`);
            lines.push('                } else {');
            lines.push(
                `                    $defineField(${parent},`
                + ` ${JSON.stringify(path[path.length - 1])}, ${trimmed});`,
            );
            lines.push('                }');
        }
        lines.push('            }');
        lines.push('        }');
    }
    return lines;
}

type PathParent = ReadonlyArray<number | string>;

function groupPathParents(paths: TrimPathsInstruction['paths']): readonly PathParent[] {
    const parents: PathParent[] = [];
    for (const path of paths) {
        const parent = path.slice(0, -1);
        if (paths.filter((candidate) => sameParent(parent, candidate)).length > 1
            && !parents.some((candidate) => samePath(candidate, parent))) {
            parents.push(parent);
        }
    }
    return parents;
}

function sameParent(parent: PathParent, path: TrimPathsInstruction['paths'][number]): boolean {
    return parent.length === path.length - 1
        && parent.every((segment, index) => segment === path[index]);
}

function samePath(left: PathParent, right: PathParent): boolean {
    return left.length === right.length
        && left.every((segment, index) => segment === right[index]);
}
