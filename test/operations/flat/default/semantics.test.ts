import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('default semantics', () => {
    it('distinguishes missing values from null', () => {
        const withDefault = spell<{ nickname?: string | null | undefined }>()
            .default('nickname', 'Anonymous' as const)
            .build();

        expect(withDefault.run({})).toEqual({ nickname: 'Anonymous' });
        expect(withDefault.run({ nickname: undefined })).toEqual({ nickname: 'Anonymous' });
        expect(withDefault.run({ nickname: null })).toEqual({ nickname: null });
    });
});
