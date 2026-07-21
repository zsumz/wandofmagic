import type { WandChange } from './receipt-types.js';

export function freezeChange(change: WandChange): WandChange {
    if (change.kind === 'derive') {
        return Object.freeze({
            ...change,
            sources: Object.freeze([...change.sources]),
        });
    }

    return Object.freeze({ ...change });
}

/** Freeze the runtime-owned receipt array after operations have frozen their own entries. */
export function freezeChanges(changes: WandChange[]): readonly WandChange[] {
    return Object.freeze(changes);
}
