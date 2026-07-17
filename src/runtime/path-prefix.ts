import type { FieldPath } from '../core/path.js';

/** Freeze a diagnostic prefix of an already normalized path. */
export function pathPrefix(path: FieldPath, length: number): FieldPath {
    return Object.freeze([path[0], ...path.slice(1, length)]);
}

/** Report whether one normalized path contains the beginning of another. */
export function isPathPrefix(prefix: FieldPath, path: FieldPath): boolean {
    return prefix.length <= path.length
        && prefix.every((segment, index) => Object.is(segment, path[index]));
}
