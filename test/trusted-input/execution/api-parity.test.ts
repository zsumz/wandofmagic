import { describe, expect, it } from 'vitest';

import { spell, wand } from '../../../src/index.js';

describe('trusted input execution APIs', () => {
    it('supports throwing execution and receipt discard through reusable and one-off APIs', () => {
        const normalize = spell<{ label: string }>().trim(['label']).build();
        const options = { input: 'trusted', receipt: 'discard' } as const;

        expect(normalize.run({ label: '  reusable  ' }, options)).toEqual({ label: 'reusable' });
        expect(wand({ label: '  one-off  ' }).trim(['label']).value(options)).toEqual({
            label: 'one-off',
        });
    });
});
