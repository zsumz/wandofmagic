import type { DataPath } from '../path/path.js';
import type { WandChange } from './receipt-types.js';

export function freezeChange(change: WandChange): WandChange {
    if (change.kind === 'derive') {
        return Object.freeze({
            ...change,
            sources: Object.freeze([...change.sources]),
        });
    }
    if (change.kind === 'pick') {
        return Object.freeze({
            ...change,
            paths: Object.freeze(change.paths.map(freezePath)),
        });
    }

    return Object.freeze({ ...change });
}

function freezePath(path: DataPath): DataPath {
    const [root, ...rest] = path;
    return Object.freeze([root, ...rest]);
}

/** Freeze the runtime-owned receipt array after operations have frozen their own entries. */
export function freezeChanges(changes: WandChange[]): readonly WandChange[] {
    return Object.freeze(changes);
}
