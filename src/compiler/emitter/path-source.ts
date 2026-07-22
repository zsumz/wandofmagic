import type { FieldPath } from '../../core/path/path.js';
import type { EmitterState } from './emitter-state.js';

/** Register one normalized path for immutable module-level emission. */
export function pathSource(path: FieldPath, state: EmitterState): string {
    return pathName(registerPath(path, state));
}

export function pathsSource(paths: readonly FieldPath[], state: EmitterState): string {
    const indexes = paths.map((path) => registerPath(path, state));
    const key = indexes.join(',');
    const existing = state.pathGroupIndexes.get(key);
    if (existing !== undefined) {
        return pathGroupName(existing);
    }
    const index = state.pathGroups.length;
    state.pathGroupIndexes.set(key, index);
    state.pathGroups.push(indexes);
    return pathGroupName(index);
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
    for (let index = 0; index < state.pathGroups.length; index += 1) {
        const group = state.pathGroups[index] ?? [];
        lines.push(
            `const ${pathGroupName(index)} = Object.freeze([${group.map(pathName).join(', ')}]);`,
        );
    }
    return lines;
}

function pathName(index: number): string {
    return `$path${String(index)}`;
}

function pathGroupName(index: number): string {
    return `$paths${String(index)}`;
}
