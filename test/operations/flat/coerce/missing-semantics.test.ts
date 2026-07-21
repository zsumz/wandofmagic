import { describe, expect, it } from 'vitest';
import { defineCoercer } from '../../../../src/coerce/index.js';
import { spell } from '../../../../src/index.js';

describe('coerce missing-value semantics', () => {
    it('passes null to coercers', () => {
        const nullCoercer = defineCoercer<null, 'coerced-null'>({
            name: 'null-probe',
            run: (value) =>
                value === null
                    ? { ok: true, value: 'coerced-null' }
                    : { message: 'Expected null.', ok: false },
        });
        const normalize = spell<{ value: null }>().coerce('value', nullCoercer).build();

        expect(normalize.run({ value: null })).toEqual({ value: 'coerced-null' });
    });
});
