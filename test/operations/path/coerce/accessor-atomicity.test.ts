import { describe, expect, it, vi } from 'vitest';

import { number } from '../../../../src/coerce/builtin/number.js';
import { defineCoercer } from '../../../../src/coerce/types.js';
import { spell } from '../../../../src/index.js';

describe('deep coerce accessor atomicity', () => {
    it('does not invoke accessors or mutate input when a path cannot be committed', () => {
        const getter = vi.fn(() => 'secret');
        const profile = Object.defineProperty({ count: '9' }, 'private', {
            enumerable: true,
            get: getter,
        });
        const input = { profile };
        const result = spell<typeof input>()
            .coerce(['profile', 'count'], number(), { id: 'safe-coerce' })
            .build()
            .safeRun(input);
        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['profile', 'private'],
                step: { id: 'safe-coerce', kind: 'coerce' },
            }],
            ok: false,
        });
        expect(getter).not.toHaveBeenCalled();
        expect(input.profile.count).toBe('9');

        const selectedGetter = vi.fn(() => '10');
        const selectedRun = vi.fn(() => ({ ok: true as const, value: 10 }));
        const selectedCoercer = defineCoercer<string, number>({
            name: 'selected',
            run: selectedRun,
        });
        const selectedProfile = Object.defineProperty({} as { count: string }, 'count', {
            enumerable: true,
            get: selectedGetter,
        });
        const selectedResult = spell<{ profile: { count: string } }>()
            .coerce(['profile', 'count'], selectedCoercer)
            .build()
            .safeRun({ profile: selectedProfile });
        expect(selectedResult).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['profile', 'count'] }],
            ok: false,
        });
        expect(selectedRun).not.toHaveBeenCalled();
        expect(selectedGetter).not.toHaveBeenCalled();
    });
});
