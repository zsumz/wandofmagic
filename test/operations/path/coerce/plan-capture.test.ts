import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep coerce plan capture', () => {
    it('captures coercer behavior when the plan is built', () => {
        const mutable = {
            name: 'captured',
            run: () => ({ ok: true as const, value: 1 }),
        };
        const normalize = spell<{ profile: { value: string } }>()
            .coerce(['profile', 'value'], mutable)
            .build();
        mutable.name = 'mutated';
        mutable.run = () => ({ ok: true, value: 2 });

        const result = normalize.safeRun({ profile: { value: 'input' } });
        expect(result).toMatchObject({
            changes: [{ coercer: 'captured' }],
            ok: true,
            value: { profile: { value: 1 } },
        });
    });
});
