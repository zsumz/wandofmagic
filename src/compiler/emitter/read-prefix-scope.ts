import type { FieldPath } from '../../core/path/path.js';
import type { ActiveReadPrefix, EmitterState } from './emitter-state.js';
import { registerReadPrefix } from './path-source.js';

export function beginReadPrefixScope(
    paths: readonly FieldPath[],
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    const prefixes = selectSharedPrefixes(paths).map((path) => {
        const index = registerReadPrefix(path, state);
        return {
            index,
            path,
            variable: `$readPrefix${String(operationIndex)}_${String(index)}`,
        } satisfies ActiveReadPrefix;
    });
    state.activeReadPrefixes = prefixes;
    return prefixes.map((prefix) => `        let ${prefix.variable};`);
}

export function endReadPrefixScope(state: EmitterState): void {
    state.activeReadPrefixes = [];
}

function selectSharedPrefixes(paths: readonly FieldPath[]): readonly FieldPath[] {
    const candidates = uniquePrefixes(paths);
    const assignments = paths.map((path) => deepestPrefix(candidates, path));
    return candidates.filter((candidate) =>
        assignments.filter((assigned) => assigned === candidate).length > 1);
}

function uniquePrefixes(paths: readonly FieldPath[]): FieldPath[] {
    const prefixes: FieldPath[] = [];
    for (let left = 0; left < paths.length; left += 1) {
        for (let right = left + 1; right < paths.length; right += 1) {
            const prefix = commonProperPrefix(paths[left], paths[right]);
            if (prefix !== undefined && !prefixes.some((candidate) => samePath(candidate, prefix))) {
                prefixes.push(prefix);
            }
        }
    }
    return prefixes;
}

function commonProperPrefix(
    left: FieldPath | undefined,
    right: FieldPath | undefined,
): FieldPath | undefined {
    if (left === undefined || right === undefined) {
        return undefined;
    }
    const limit = Math.min(left.length, right.length) - 1;
    let length = 0;
    while (length < limit && left[length] === right[length]) {
        length += 1;
    }
    const first = left[0];
    if (length === 0) {
        return undefined;
    }
    const prefix: [string, ...Array<number | string>] = [first, ...left.slice(1, length)];
    return prefix;
}

function deepestPrefix(prefixes: readonly FieldPath[], path: FieldPath): FieldPath | undefined {
    return prefixes
        .filter((prefix) => isProperPrefix(prefix, path))
        .sort((left, right) => right.length - left.length)[0];
}

function isProperPrefix(prefix: FieldPath, path: FieldPath): boolean {
    return prefix.length < path.length
        && prefix.every((segment, index) => segment === path[index]);
}

function samePath(left: FieldPath, right: FieldPath): boolean {
    return left.length === right.length
        && left.every((segment, index) => segment === right[index]);
}
