import { describe, expect, it, vi } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep default atomicity', () => {
    it('rejects touched accessors atomically without invoking getters', () => {
        const siblingGetter = vi.fn(() => 'secret');
        const profile = Object.defineProperty({}, 'private', {
            enumerable: true,
            get: siblingGetter,
        });
        const input = { profile };
        const result = spell<{ profile: { value?: string } }>()
            .default(['profile', 'value'], 'ready', { id: 'safe-default' })
            .build()
            .safeRun(input);
        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['profile', 'private'],
                step: { id: 'safe-default', kind: 'default' },
            }],
            ok: false,
        });
        expect(siblingGetter).not.toHaveBeenCalled();
        expect('value' in profile).toBe(false);

        const selectedGetter = vi.fn(() => undefined);
        const selected = Object.defineProperty({}, 'value', {
            enumerable: true,
            get: selectedGetter,
        });
        const selectedResult = spell<{ profile: { value?: string } }>()
            .default(['profile', 'value'], 'ready')
            .build()
            .safeRun({ profile: selected });
        expect(selectedResult).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['profile', 'value'] }],
            ok: false,
        });
        expect(selectedGetter).not.toHaveBeenCalled();
    });
});
