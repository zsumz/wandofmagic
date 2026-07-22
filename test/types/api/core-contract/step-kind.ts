import type { StepKind } from 'wandofmagic';

import { assertNever } from './assert-never.js';

function readStepKind(kind: StepKind): string {
    switch (kind) {
        case 'coerce':
        case 'copy':
        case 'default':
        case 'derive':
        case 'move':
        case 'omit':
        case 'pick':
        case 'rename':
        case 'set':
        case 'transform':
        case 'trim':
            return kind;
        default:
            return assertNever(kind);
    }
}

void readStepKind;
