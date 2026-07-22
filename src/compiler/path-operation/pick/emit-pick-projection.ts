import type { FieldPath, PathSegment } from '../../../core/path/path.js';
import type { PickInstruction } from '../../../instructions/path/path-operation.js';
import type { EmitterState } from '../../emitter/emitter-state.js';
import { readPathSource } from '../../emitter/path-source.js';
import { sourceString } from '../../emitter/source-string.js';

interface ProjectionPrefix {
    readonly key: string;
    readonly variable: string;
}

export function emitPickProjection(
    instruction: PickInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    const suffix = String(operationIndex);
    const projected = `$projected${suffix}`;
    const prefixes = collectProjectionPrefixes(instruction.paths, suffix);
    const lines = [
        `        const ${projected} = Object.getPrototypeOf($value) === null`,
        '            ? Object.create(null) : {};',
        `        $ownership.set(${projected}, 1);`,
        ...prefixes.map((prefix) => `        let ${prefix.variable};`),
    ];
    for (let index = 0; index < instruction.paths.length; index += 1) {
        const path = instruction.paths[index];
        if (path !== undefined) {
            lines.push(...emitSelectedPath(
                path,
                index,
                instruction.id,
                suffix,
                projected,
                prefixes,
                state,
            ));
        }
    }
    lines.push(`        $value = ${projected};`);
    return lines;
}

function emitSelectedPath(
    path: FieldPath,
    index: number,
    stepId: string,
    suffix: string,
    projected: string,
    prefixes: readonly ProjectionPrefix[],
    state: EmitterState,
): readonly string[] {
    const read = `$pickRead${suffix}_${String(index)}`;
    const lines = [
        `        const ${read} = ${readPathSource('$value', path, state)};`,
        `        if (${read}.status === "failed") {`,
        `            $failIssue($WandError, ${read}.issue, ${sourceString(stepId)}, "pick");`,
        '        }',
        `        if (${read}.status === "found") {`,
    ];
    let parent = projected;
    for (let depth = 0; depth < path.length - 1; depth += 1) {
        const prefix = requirePrefix(prefixes, path.slice(0, depth + 1));
        const segment = pathSegmentSource(path[depth]);
        const container = typeof path[depth + 1] === 'number' ? '[]' : '{}';
        lines.push(`            if (${prefix.variable} === undefined) {`);
        lines.push(`                ${prefix.variable} = ${container};`);
        lines.push(`                $ownership.set(${prefix.variable}, 1);`);
        lines.push(`                $defineField(${parent}, ${segment}, ${prefix.variable});`);
        lines.push('            }');
        parent = prefix.variable;
    }
    lines.push(
        `            if (typeof ${read}.value === "object" && ${read}.value !== null`
        + ` && $ownership.has(${read}.value)) {`,
    );
    lines.push(`                $ownership.set(${read}.value, 2);`);
    lines.push('            }');
    lines.push(
        `            $defineField(${parent}, ${pathSegmentSource(path[path.length - 1])},`
        + ` ${read}.value);`,
    );
    lines.push('        }');
    return lines;
}

function collectProjectionPrefixes(
    paths: readonly FieldPath[],
    suffix: string,
): readonly ProjectionPrefix[] {
    const prefixes: ProjectionPrefix[] = [];
    for (const path of paths) {
        for (let depth = 1; depth < path.length; depth += 1) {
            const key = pathKey(path.slice(0, depth));
            if (!prefixes.some((prefix) => prefix.key === key)) {
                prefixes.push({ key, variable: `$projectedNode${suffix}_${String(prefixes.length)}` });
            }
        }
    }
    return prefixes;
}

function requirePrefix(
    prefixes: readonly ProjectionPrefix[],
    path: readonly PathSegment[],
): ProjectionPrefix {
    const key = pathKey(path);
    const prefix = prefixes.find((candidate) => candidate.key === key);
    if (prefix === undefined) {
        throw new TypeError('A generated projection prefix is missing.');
    }
    return prefix;
}

function pathKey(path: readonly PathSegment[]): string {
    return JSON.stringify(path);
}

function pathSegmentSource(segment: PathSegment | undefined): string {
    if (segment === undefined) {
        throw new TypeError('A generated projection segment is missing.');
    }
    return JSON.stringify(segment);
}
