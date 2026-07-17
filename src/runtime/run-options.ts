import type { InputPolicy, ReceiptPolicy } from '../core/options.js';
import { getDataPropertyValue } from '../internal/type-boundary.js';

export interface ResolvedRunOptions {
    readonly input: InputPolicy;
    readonly receipt: ReceiptPolicy;
}

const checkedCollect = Object.freeze({ input: 'checked', receipt: 'collect' } as const);
const checkedDiscard = Object.freeze({ input: 'checked', receipt: 'discard' } as const);
const trustedCollect = Object.freeze({ input: 'trusted', receipt: 'collect' } as const);
const trustedDiscard = Object.freeze({ input: 'trusted', receipt: 'discard' } as const);
const resolvedOptions: WeakMap<object, ResolvedRunOptions> = new WeakMap();

/** Resolve and validate execution options at the JavaScript boundary. */
export function resolveRunOptions(options: unknown): ResolvedRunOptions {
    if (typeof options !== 'object' || options === null) {
        throw new TypeError('RunOptions must be an object.');
    }

    const cached = resolvedOptions.get(options);
    if (cached !== undefined) {
        return cached;
    }

    const input = readInputPolicy(options);
    const receipt = readReceiptPolicy(options);
    const resolved = input === 'trusted'
        ? receipt === 'discard' ? trustedDiscard : trustedCollect
        : receipt === 'discard' ? checkedDiscard : checkedCollect;
    if (Object.isFrozen(options)) {
        resolvedOptions.set(options, resolved);
    }
    return resolved;
}

export function defaultRunOptions(): ResolvedRunOptions {
    return checkedCollect;
}

function readInputPolicy(options: object): InputPolicy {
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

function readReceiptPolicy(options: object): ReceiptPolicy {
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
