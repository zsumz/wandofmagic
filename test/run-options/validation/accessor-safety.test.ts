import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/index.js';

describe('execution option accessor safety', () => {
    it('rejects option accessors without invoking them', () => {
        const identity = spell<Record<string, unknown>>().build();
        let getterCalls = 0;
        const receiptAccessor = Object.defineProperty({}, 'receipt', {
            enumerable: true,
            get() {
                getterCalls += 1;
                return 'discard';
            },
        });

        expect(() => identity.safeRun({}, receiptAccessor)).toThrow(
            new TypeError('RunOptions.receipt must be a data property.'),
        );
        expect(getterCalls).toBe(0);

        const inputAccessor = Object.defineProperty({}, 'input', {
            enumerable: true,
            get() {
                getterCalls += 1;
                return 'trusted';
            },
        });
        expect(() => identity.safeRun({}, inputAccessor)).toThrow(
            new TypeError('RunOptions.input must be a data property.'),
        );
        expect(getterCalls).toBe(0);
    });
});
