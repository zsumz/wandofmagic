import type { FieldPath } from '../../core/path/path.js';
import type { ActiveReadPrefix, EmitterState } from './emitter-state.js';
import { pathName, readPathName, readPrefixName } from './path-program-names.js';
import { emitReadPathProgram, emitReadPrefixProgram } from './read-program-source.js';

/** Register one normalized path for immutable module-level emission. */
export function pathSource(path: FieldPath, state: EmitterState): string {
    return pathName(registerPath(path, state));
}

export function readPathSource(
    root: string,
    path: FieldPath,
    state: EmitterState,
): string {
    const pathIndex = registerPath(path, state);
    const prefix = deepestActivePrefix(path, state.activeReadPrefixes);
    const prefixIndex = prefix?.index;
    const key = `${String(pathIndex)}:${prefixIndex === undefined ? '' : String(prefixIndex)}`;
    state.readPathPrograms.set(key, {
        pathIndex,
        ...prefixIndex === undefined ? {} : { prefixIndex },
    });
    const name = readPathName(pathIndex, prefixIndex);
    if (prefix === undefined) {
        return `${name}(${root})`;
    }
    return `${name}(${root}, ${prefix.variable} ??= ${readPrefixName(prefix.index)}(${root}))`;
}

/** Reuse a validated operation-local prefix as the owner above a deep write parent. */
export function currentReadAncestorSource(
    path: FieldPath,
    state: EmitterState,
): string | undefined {
    if (path.length < 3) {
        return undefined;
    }
    const prefix = deepestActivePrefix(path, state.activeReadPrefixes);
    const ancestorDepth = path.length - 2;
    return prefix !== undefined && prefix.path.length >= ancestorDepth
        ? `${prefix.variable}.containers[${String(ancestorDepth)}]`
        : undefined;
}

export function registerReadPrefix(path: FieldPath, state: EmitterState): number {
    const index = registerPath(path, state);
    state.readPrefixIndexes.add(index);
    return index;
}

export function emitPathDeclarations(state: EmitterState): readonly string[] {
    const lines = state.paths.map((path, index) =>
        `const ${pathName(index)} = Object.freeze(${JSON.stringify(path)});`);
    for (const index of state.readPrefixIndexes) {
        const path = state.paths[index];
        if (path !== undefined) {
            lines.push('', ...emitReadPrefixProgram(path, index));
        }
    }
    for (const program of state.readPathPrograms.values()) {
        const path = state.paths[program.pathIndex];
        const prefix = program.prefixIndex === undefined
            ? undefined
            : state.paths[program.prefixIndex];
        if (path !== undefined) {
            lines.push('', ...emitReadPathProgram(
                path,
                program.pathIndex,
                prefix,
                program.prefixIndex,
            ));
        }
    }
    return lines;
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

function deepestActivePrefix(
    path: FieldPath,
    prefixes: readonly ActiveReadPrefix[],
): ActiveReadPrefix | undefined {
    return prefixes
        .filter((prefix) => prefix.path.length < path.length
            && prefix.path.every((segment, index) => segment === path[index]))
        .sort((left, right) => right.path.length - left.path.length)[0];
}
