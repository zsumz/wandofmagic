import type { DataPath } from '../../core/path/path.js';

export function prefixCollectionPath(index: number, path?: DataPath): DataPath {
    return Object.freeze(path === undefined ? [index] : [index, ...path]);
}
