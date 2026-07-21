import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/index.js';

describe('execution option policy validation', () => {
    it('rejects invalid option shapes and policy values from JavaScript callers', () => {
        const identity = spell<Record<string, unknown>>().build();

        expect(() => identity.safeRun({}, null as never)).toThrow(
            new TypeError('RunOptions must be an object.'),
        );
        expect(() => identity.safeRun({}, { receipt: 'retain' } as never)).toThrow(
            new TypeError('RunOptions.receipt must be either "collect" or "discard".'),
        );
        expect(() => identity.safeRun({}, { input: 'assumed' } as never)).toThrow(
            new TypeError('RunOptions.input must be either "checked" or "trusted".'),
        );
    });
});
