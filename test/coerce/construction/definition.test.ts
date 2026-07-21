import { describe, expect, it } from 'vitest';
import { defineCoercer } from '../../../src/coerce/index.js';

describe('coercer definitions', () => {
    it('requires stable names', () => {
        expect(() =>
            defineCoercer<string, string>({
                name: 'not a stable name',
                run: (value) => ({ ok: true, value: String(value) }),
            }),
        ).toThrow(TypeError);
    });
});
