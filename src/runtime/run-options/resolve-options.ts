import type {
    InputPolicy,
    ReceiptPolicy,
} from '../../core/execution/run-options.js';
import { readInputPolicy, readReceiptPolicy } from './read-policies.js';

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
