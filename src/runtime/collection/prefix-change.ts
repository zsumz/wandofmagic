import { freezeChange } from '../../core/change/freeze-receipt.js';
import type { WandChange } from '../../core/change/receipt-types.js';
import { prefixCollectionPath } from './prefix-path.js';

export function prefixCollectionChange(index: number, change: WandChange): WandChange {
    switch (change.kind) {
        case 'derive':
            return freezeChange({
                ...change,
                path: prefixCollectionPath(index, change.path),
                sources: change.sources.map((path) => prefixCollectionPath(index, path)),
            });
        case 'copy':
        case 'move':
        case 'rename':
            return freezeChange({
                ...change,
                from: prefixCollectionPath(index, change.from),
                to: prefixCollectionPath(index, change.to),
            });
        case 'coerce':
        case 'default':
        case 'omit':
        case 'set':
        case 'transform':
        case 'trim':
            return freezeChange({
                ...change,
                path: prefixCollectionPath(index, change.path),
            });
    }
}
