import type { FieldPath } from '../../core/path/path.js';
import type { EmitterState } from './emitter-state.js';

/** Register one normalized path for immutable module-level emission. */
export function pathSource(path: FieldPath, state: EmitterState): string {
    return pathName(registerPath(path, state));
}

export function readPathSource(
    root: string,
    path: FieldPath,
    state: EmitterState,
): string {
    const index = registerPath(path, state);
    state.readPathIndexes.add(index);
    return `${readPathName(index)}(${root})`;
}

export function pathsSource(paths: readonly FieldPath[], state: EmitterState): string {
    return pathGroupName(registerPathGroup(paths, state));
}

export function pathReadersSource(paths: readonly FieldPath[], state: EmitterState): string {
    const groupIndex = registerPathGroup(paths, state);
    state.readPathGroupIndexes.add(groupIndex);
    for (const pathIndex of state.pathGroups[groupIndex] ?? []) {
        state.readPathIndexes.add(pathIndex);
    }
    return pathReadersName(groupIndex);
}

function registerPathGroup(paths: readonly FieldPath[], state: EmitterState): number {
    const indexes = paths.map((path) => registerPath(path, state));
    const key = indexes.join(',');
    const existing = state.pathGroupIndexes.get(key);
    if (existing !== undefined) {
        return existing;
    }
    const index = state.pathGroups.length;
    state.pathGroupIndexes.set(key, index);
    state.pathGroups.push(indexes);
    return index;
}

function registerPath(path: FieldPath, state: EmitterState): number {
    const key = JSON.stringify(path);
    const existing = state.pathIndexes.get(key);
    if (existing !== undefined) {
        return existing;
    }
    const index = state.paths.length;
    state.pathIndexes.set(key, index);
    state.paths.push(path);
    return index;
}

export function emitPathDeclarations(state: EmitterState): readonly string[] {
    const lines = state.paths.map((path, index) =>
        `const ${pathName(index)} = Object.freeze(${JSON.stringify(path)});`);
    for (const index of state.readPathIndexes) {
        const path = state.paths[index];
        if (path !== undefined) {
            lines.push('', ...emitReadPathProgram(path, index));
        }
    }
    for (let index = 0; index < state.pathGroups.length; index += 1) {
        const group = state.pathGroups[index] ?? [];
        lines.push(
            `const ${pathGroupName(index)} = Object.freeze([${group.map(pathName).join(', ')}]);`,
        );
        if (state.readPathGroupIndexes.has(index)) {
            lines.push(
                `const ${pathReadersName(index)} = Object.freeze([`
                + `${group.map(readPathName).join(', ')}]);`,
            );
        }
    }
    return lines;
}

function emitReadPathProgram(path: FieldPath, pathIndex: number): readonly string[] {
    const pathReference = pathName(pathIndex);
    const lines = [
        `function ${readPathName(pathIndex)}($root) {`,
        '    const $container0 = $root;',
    ];
    for (let index = 0; index < path.length; index += 1) {
        const read = `$read${String(index)}`;
        const container = `$container${String(index)}`;
        const length = String(index + 1);
        lines.push(
            `    const ${read} = $readField(`
            + `${container}, ${JSON.stringify(path[index])}, ${pathReference}, ${length}`
            + `${index === path.length - 1 ? ', true' : ''});`,
        );
        lines.push(`    if (${read}.status !== "found") {`);
        lines.push(`        return ${read};`);
        lines.push('    }');
        if (index === path.length - 1) {
            lines.push(`    return ${read};`);
            continue;
        }
        lines.push(`    if (${read}.value === undefined) {`);
        lines.push('        return { status: "missing" };');
        lines.push('    }');
        const inspection = `$inspection${String(index)}`;
        const child = `$container${String(index + 1)}`;
        lines.push(
            `    const ${inspection} = $inspectContainer(`
            + `${read}.value, ${pathReference}, ${length});`,
        );
        lines.push(`    if (!${inspection}.ok) {`);
        lines.push(`        return { status: "failed", issue: ${inspection}.issue };`);
        lines.push('    }');
        lines.push(`    const ${child} = ${inspection}.value;`);
        const previous = Array.from(
            { length: index + 1 },
            (_, previousIndex) => `${child} === $container${String(previousIndex)}`,
        );
        lines.push(`    if (${previous.join(' || ')}) {`);
        lines.push('        return { status: "failed", issue: $pathIssue(');
        lines.push('            "invalid_input",');
        lines.push('            "Wandofmagic will not traverse a cycle along the selected path.",');
        lines.push(`            ${pathReference}, ${length},`);
        lines.push('        ) };');
        lines.push('    }');
    }
    lines.push('}');
    return lines;
}

function pathName(index: number): string {
    return `$path${String(index)}`;
}

function pathGroupName(index: number): string {
    return `$paths${String(index)}`;
}

function pathReadersName(index: number): string {
    return `$pathReaders${String(index)}`;
}

function readPathName(index: number): string {
    return `$readPath${String(index)}`;
}
