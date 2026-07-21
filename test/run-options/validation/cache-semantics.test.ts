import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/index.js';

describe('execution option cache semantics', () => {
    it('only caches frozen option objects and observes mutations to ordinary objects', () => {
        const normalize = spell<{ label: string }>().trim(['label']).build();
        const options: { receipt: 'collect' | 'discard' } = { receipt: 'discard' };

        expect(normalize.safeRun({ label: '  first  ' }, options)).toMatchObject({
            changes: [],
            ok: true,
        });

        options.receipt = 'collect';
        expect(normalize.safeRun({ label: '  second  ' }, options)).toMatchObject({
            changes: [{ kind: 'trim' }],
            ok: true,
        });

        const frozen = Object.freeze({ input: 'trusted', receipt: 'discard' } as const);
        expect(normalize.run({ label: '  fast  ' }, frozen)).toEqual({ label: 'fast' });
        expect(normalize.run({ label: '  again  ' }, frozen)).toEqual({ label: 'again' });
    });
});
