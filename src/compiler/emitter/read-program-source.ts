import type { FieldPath } from '../../core/path/path.js';
import { pathName, readPathName, readPrefixName } from './path-program-names.js';

export function emitReadPrefixProgram(path: FieldPath, index: number): readonly string[] {
    const pathReference = pathName(index);
    const lines = [
        `function ${readPrefixName(index)}($root) {`,
        '    const $container0 = $root;',
    ];
    for (let depth = 0; depth < path.length; depth += 1) {
        lines.push(...emitContainerRead(path, pathReference, depth));
        lines.push(...emitLocalCycleCheck(pathReference, depth));
    }
    const containers = Array.from(
        { length: path.length + 1 },
        (_, depth) => `$container${String(depth)}`,
    ).join(', ');
    lines.push(
        `    return { containers: [${containers}], status: "found",`
        + ` value: $container${String(path.length)} };`,
    );
    lines.push('}');
    return lines;
}

export function emitReadPathProgram(
    path: FieldPath,
    pathIndex: number,
    prefix?: FieldPath,
    prefixIndex?: number,
): readonly string[] {
    const pathReference = pathName(pathIndex);
    const start = prefix?.length ?? 0;
    const name = readPathName(pathIndex, prefixIndex);
    const lines = prefix === undefined
        ? [`function ${name}($root) {`, '    const $container0 = $root;']
        : [
            `function ${name}($root, $prefix) {`,
            '    if ($prefix.status !== "found") {',
            '        return $prefix;',
            '    }',
            `    const $container${String(start)} = $prefix.value;`,
        ];
    for (let depth = start; depth < path.length; depth += 1) {
        lines.push(...emitFieldRead(path, pathReference, depth));
        if (depth < path.length - 1) {
            lines.push(...emitInspectedChild(pathReference, depth));
            lines.push(...emitPathCycleCheck(pathReference, depth, start));
        }
    }
    lines.push('}');
    return lines;
}

function emitContainerRead(
    path: FieldPath,
    pathReference: string,
    depth: number,
): readonly string[] {
    return [
        ...emitFieldRead(path, pathReference, depth, false),
        `    if ($read${String(depth)}.value === undefined) {`,
        '        return { status: "missing" };',
        '    }',
        ...emitInspectedChild(pathReference, depth),
    ];
}

function emitFieldRead(
    path: FieldPath,
    pathReference: string,
    depth: number,
    terminal = depth === path.length - 1,
): readonly string[] {
    const terminalArgument = terminal ? ', true' : '';
    return [
        `    const $read${String(depth)} = $readField(`
        + `$container${String(depth)}, ${JSON.stringify(path[depth])},`
        + ` ${pathReference}, ${String(depth + 1)}${terminalArgument});`,
        `    if ($read${String(depth)}.status !== "found") {`,
        `        return $read${String(depth)};`,
        '    }',
        ...terminal ? [`    return $read${String(depth)};`] : [],
    ];
}

function emitInspectedChild(pathReference: string, depth: number): readonly string[] {
    return [
        `    const $inspection${String(depth)} = $inspectContainer(`
        + `$read${String(depth)}.value, ${pathReference}, ${String(depth + 1)});`,
        `    if (!$inspection${String(depth)}.ok) {`,
        `        return { status: "failed", issue: $inspection${String(depth)}.issue };`,
        '    }',
        `    const $container${String(depth + 1)} = $inspection${String(depth)}.value;`,
    ];
}

function emitLocalCycleCheck(pathReference: string, depth: number): readonly string[] {
    const child = `$container${String(depth + 1)}`;
    const previous = Array.from(
        { length: depth + 1 },
        (_, index) => `${child} === $container${String(index)}`,
    );
    return emitCycleFailure(previous, pathReference, depth + 1);
}

function emitPathCycleCheck(
    pathReference: string,
    depth: number,
    prefixDepth: number,
): readonly string[] {
    const child = `$container${String(depth + 1)}`;
    const previous = prefixDepth === 0
        ? Array.from(
            { length: depth + 1 },
            (_, index) => `${child} === $container${String(index)}`,
        )
        : [
            ...Array.from(
                { length: prefixDepth + 1 },
                (_, index) => `${child} === $prefix.containers[${String(index)}]`,
            ),
            ...Array.from(
                { length: depth - prefixDepth },
                (_, index) => `${child} === $container${String(prefixDepth + index + 1)}`,
            ),
        ];
    return emitCycleFailure(previous, pathReference, depth + 1);
}

function emitCycleFailure(
    comparisons: readonly string[],
    pathReference: string,
    length: number,
): readonly string[] {
    return [
        `    if (${comparisons.join(' || ')}) {`,
        '        return { status: "failed", issue: $pathIssue(',
        '            "invalid_input",',
        '            "Wandofmagic will not traverse a cycle along the selected path.",',
        `            ${pathReference}, ${String(length)},`,
        '        ) };',
        '    }',
    ];
}
