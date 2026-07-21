import { describe, expect, it } from 'vitest';

import { number } from '../../../../src/coerce/builtin/number.js';
import { defineCoercer } from '../../../../src/coerce/types.js';
import { spell } from '../../../../src/index.js';

describe('deep coerce value semantics', () => {
    it('preserves identity conversions and allows coercers to accept null', () => {
        const identity = spell<{ profile: { count: string | number } }>()
            .coerce(['profile', 'count'], number())
            .build();
        expect(identity.safeRun({ profile: { count: 3 } }))
            .toMatchObject({ changes: [], ok: true });

        const nullCoercer = defineCoercer<null, 'null-value'>({
            name: 'null-value',
            run: (value) => value === null
                ? { ok: true, value: 'null-value' }
                : { message: 'Expected null.', ok: false },
        });
        expect(spell<{ profile: { value: null } }>()
            .coerce(['profile', 'value'], nullCoercer)
            .build()
            .run({ profile: { value: null } }).profile.value).toBe('null-value');
    });
});
