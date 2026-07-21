import { describe, expect, it, vi } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep omit data-model safety', () => {
    it('preserves null prototypes and sparse-array positions', () => {
        const profile = Object.create(null) as { secret: string; visible: boolean };
        profile.secret = 'private';
        profile.visible = true;
        const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const output = spell<{ profile: typeof profile; rows: typeof rows }>()
            .omit([['profile', 'secret'], ['rows', 1]])
            .build()
            .run({ profile, rows });

        expect(Object.getPrototypeOf(output.profile)).toBeNull();
        expect(output.profile.visible).toBe(true);
        expect('secret' in output.profile).toBe(false);
        expect(output.rows).toHaveLength(3);
        expect(1 in output.rows).toBe(false);
        expect(output.rows[2]).toBe(rows[2]);
    });

    it('rolls back staged deletions when a later path fails without invoking getters', () => {
        const getter = vi.fn(() => 'private');
        const settings = Object.defineProperty({ visible: true }, 'computed', {
            enumerable: true,
            get: getter,
        });
        const input = { profile: { secret: 'still-present' }, settings };
        const result = spell<{
            profile: { secret: string };
            settings: { visible: boolean };
        }>()
            .omit([['profile', 'secret'], ['settings', 'visible']], { id: 'atomic-omit' })
            .build()
            .safeRun(input);

        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['settings', 'computed'],
                step: { id: 'atomic-omit', kind: 'omit' },
            }],
            ok: false,
        });
        expect(getter).not.toHaveBeenCalled();
        expect(input.profile.secret).toBe('still-present');
        expect(input.settings.visible).toBe(true);
    });
});
