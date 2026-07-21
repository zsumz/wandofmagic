import { describe, expect, it, vi } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep transform accessor atomicity', () => {
    it('does not invoke accessors or mutate input when a path cannot be committed', () => {
        const getter = vi.fn(() => 'secret');
        const callback = vi.fn((value: string) => value.toUpperCase());
        const profile = Object.defineProperty({ value: 'ready' }, 'private', {
            enumerable: true,
            get: getter,
        });
        const input = { profile };
        const result = spell<typeof input>()
            .transform(['profile', 'value'], callback, { id: 'safe-transform' })
            .build()
            .safeRun(input);

        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['profile', 'private'],
                step: { id: 'safe-transform', kind: 'transform' },
            }],
            ok: false,
        });
        expect(callback).toHaveBeenCalledOnce();
        expect(getter).not.toHaveBeenCalled();
        expect(input.profile.value).toBe('ready');

        const selectedGetter = vi.fn(() => 'selected-secret');
        const selectedCallback = vi.fn((value: string) => value.toUpperCase());
        const selectedProfile = Object.defineProperty({} as { value: string }, 'value', {
            enumerable: true,
            get: selectedGetter,
        });
        const selectedResult = spell<{ profile: { value: string } }>()
            .transform(['profile', 'value'], selectedCallback)
            .build()
            .safeRun({ profile: selectedProfile });
        expect(selectedResult).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['profile', 'value'] }],
            ok: false,
        });
        expect(selectedCallback).not.toHaveBeenCalled();
        expect(selectedGetter).not.toHaveBeenCalled();
    });
});
