import { describe, expect, it } from 'vitest';
import { spell } from '../../../src/index.js';

describe('runtime input root shape', () => {
    it('rejects arrays', () => {
        expect(spell<string[]>().build().safeRun([])).toMatchObject({
            issues: [{ code: 'invalid_input' }],
            ok: false,
        });
    });

    it('accepts null-prototype records and preserves their prototype', () => {
        const input = Object.create(null) as Record<string, unknown>;
        Object.defineProperty(input, 'value', {
            configurable: true,
            enumerable: true,
            value: 'kept',
            writable: true,
        });

        const result = spell<Record<string, unknown>>().build().run(input);
        expect(result).toEqual({ value: 'kept' });
        expect(Object.getPrototypeOf(result)).toBeNull();
    });
});
