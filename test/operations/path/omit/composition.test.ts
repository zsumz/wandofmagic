import { describe, expect, it } from 'vitest';
import { spell, wand } from '../../../../src/index.js';

describe('deep omit composition', () => {
    it('preserves flat batches and supports mixed selectors and one-off wands', () => {
        const flat = spell<{ keep: boolean; secret: string }>()
            .omit(['secret'])
            .build()
            .run({ keep: true, secret: 'private' });
        expect(flat).toEqual({ keep: true });

        const mixed = spell<{ profile: { secret: string; visible: boolean }; token: string }>()
            .omit([['token'], ['profile', 'secret']])
            .build()
            .run({ profile: { secret: 'private', visible: true }, token: 'private' });
        expect(mixed).toEqual({ profile: { visible: true } });

        expect(wand({ profile: { secret: true, visible: true } })
            .omit([['profile', 'secret']])
            .value()).toEqual({ profile: { visible: true } });
    });
});
