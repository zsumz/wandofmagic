import type { WandIssueCode } from 'wandofmagic';

import { assertNever } from './assert-never.js';

function readIssueCode(code: WandIssueCode): string {
    switch (code) {
        case 'coercion_failed':
        case 'destination_conflict':
        case 'invalid_input':
        case 'missing_field':
        case 'transform_failed':
        case 'unexpected_type':
        case 'unsupported_accessor':
            return code;
        default:
            return assertNever(code);
    }
}

void readIssueCode;
