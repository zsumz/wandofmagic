import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('path pick composition', () => {
    it('materializes prior path writes and supports following operations', () => {
        const normalize = spell<{ profile: { name: string }; secret: string }>()
            .set(['metadata', 'source'], 'wire')
            .copy(['profile', 'name'], ['metadata', 'owner'])
            .pick([['metadata', 'source'], ['metadata', 'owner']])
            .transform(['metadata', 'source'], (source) => source.toUpperCase())
            .build();

        expect(normalize.run({ profile: { name: 'Ada' }, secret: 'remove' })).toEqual({
            metadata: { owner: 'Ada', source: 'WIRE' },
        });
    });
});
