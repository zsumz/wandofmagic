import type {
    InputPolicy,
    ReceiptPolicy,
} from '../../core/execution/run-options.js';
import { getDataPropertyValue } from '../../internal/type-boundary/record.js';

export function readInputPolicy(options: object): InputPolicy {
    const descriptor = Object.getOwnPropertyDescriptor(options, 'input');
    if (descriptor === undefined) {
        return 'checked';
    }
    if (!('value' in descriptor)) {
        throw new TypeError('RunOptions.input must be a data property.');
    }

    const input = getDataPropertyValue(descriptor) ?? 'checked';
    if (input !== 'checked' && input !== 'trusted') {
        throw new TypeError('RunOptions.input must be either "checked" or "trusted".');
    }

    return input;
}

export function readReceiptPolicy(options: object): ReceiptPolicy {
    const descriptor = Object.getOwnPropertyDescriptor(options, 'receipt');
    if (descriptor === undefined) {
        return 'collect';
    }
    if (!('value' in descriptor)) {
        throw new TypeError('RunOptions.receipt must be a data property.');
    }

    const receipt = getDataPropertyValue(descriptor) ?? 'collect';
    if (receipt !== 'collect' && receipt !== 'discard') {
        throw new TypeError('RunOptions.receipt must be either "collect" or "discard".');
    }

    return receipt;
}
