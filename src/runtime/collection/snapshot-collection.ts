import { createIssue } from '../../core/issue/create-issue.js';
import type { WandIssue } from '../../core/issue/issue-types.js';
import type { InputPolicy } from '../../core/execution/run-options.js';
import { getDataPropertyValue } from '../../internal/type-boundary/record.js';

export type CollectionSnapshot =
    | { readonly entries: readonly CollectionEntry[]; readonly length: number; readonly ok: true }
    | { readonly issue: WandIssue; readonly ok: false };

export interface CollectionEntry {
    readonly index: number;
    readonly value: unknown;
}

export function snapshotCollection(input: object, policy: InputPolicy): CollectionSnapshot {
    try {
        if (!Array.isArray(input)) {
            return invalidCollection('Wandofmagic collections require an array at the root.');
        }
        if (Object.getPrototypeOf(input) !== Array.prototype) {
            return invalidCollection('Wandofmagic collections require a plain array at the root.');
        }
        return snapshotArray(input, policy);
    } catch (cause) {
        return {
            issue: createIssue({
                cause,
                code: 'invalid_input',
                message: 'Wandofmagic could not inspect the input collection.',
            }),
            ok: false,
        };
    }
}

function snapshotArray(input: unknown[], policy: InputPolicy): CollectionSnapshot {
    if (policy === 'checked' && hasEnumerableSymbol(input)) {
        return invalidCollection(
            'Enumerable symbol keys are outside Wandofmagic\'s JSON-like collection model.',
        );
    }
    const entries: CollectionEntry[] = [];
    for (const key of Object.keys(input)) {
        const index = arrayIndex(key, input.length);
        if (index === undefined) {
            return invalidCollection('Wandofmagic collections do not accept custom enumerable fields.');
        }
        if (policy === 'trusted') {
            entries.push(Object.freeze({ index, value: input[index] }));
            continue;
        }
        const descriptor = Object.getOwnPropertyDescriptor(input, key);
        if (descriptor === undefined) {
            continue;
        }
        if (!('value' in descriptor)) {
            return {
                issue: createIssue({
                    code: 'unsupported_accessor',
                    message: `Wandofmagic will not execute the accessor at collection index ${key}.`,
                    path: Object.freeze([index]),
                }),
                ok: false,
            };
        }
        entries.push(Object.freeze({ index, value: getDataPropertyValue(descriptor) }));
    }
    return { entries: Object.freeze(entries), length: input.length, ok: true };
}

function hasEnumerableSymbol(input: unknown[]): boolean {
    return Object.getOwnPropertySymbols(input).some((symbol) =>
        Object.getOwnPropertyDescriptor(input, symbol)?.enumerable === true);
}

function arrayIndex(key: string, length: number): number | undefined {
    const index = Number(key);
    return Number.isInteger(index) && index >= 0 && index < length && String(index) === key
        ? index
        : undefined;
}

function invalidCollection(message: string): CollectionSnapshot {
    return { issue: createIssue({ code: 'invalid_input', message }), ok: false };
}
