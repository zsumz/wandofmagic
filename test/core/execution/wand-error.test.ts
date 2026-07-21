import { describe, expect, it } from 'vitest';
import { spell, WandError } from '../../../src/index.js';

describe('WandError', () => {
    it('serializes without losing its structured receipt', () => {
        const result = spell<{ value?: string }>()
            .transform('value', (value) => value)
            .build()
            .safeRun({});
        if (result.ok) {
            throw new Error('Expected a failure fixture.');
        }

        const error = new WandError(result);
        expect(error.toJSON()).toEqual({
            changes: [],
            issues: result.issues,
            message: result.issues[0]?.message,
            name: 'WandError',
        });
    });

    it('uses a stable fallback message for an empty failure', () => {
        const error = new WandError({ changes: [], issues: [], ok: false });

        expect(error.message).toBe('Wandofmagic could not transform the value.');
    });
});
