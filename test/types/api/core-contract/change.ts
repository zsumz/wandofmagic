import type { DataPath, WandChange } from 'wandofmagic';

import { assertNever } from './assert-never.js';

function readChange(change: WandChange): unknown {
    switch (change.kind) {
        case 'coerce':
            return [change.coercer, change.fromType, change.path, change.stepId, change.toType];
        case 'default':
        case 'omit':
        case 'set':
        case 'transform':
        case 'trim':
            return [change.path, change.stepId];
        case 'pick':
            return [change.paths, change.stepId];
        case 'derive':
            return [change.path, change.sources, change.stepId];
        case 'copy':
        case 'move':
        case 'rename':
            return [change.from, change.stepId, change.to];
        default:
            return assertNever(change);
    }
}

void readChange;

const collectionPath: DataPath = [3, 'profile', 'name'];
void collectionPath;
