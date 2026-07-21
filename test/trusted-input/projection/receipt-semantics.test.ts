import { describe, expect, it } from 'vitest';
import { createProjectedSpell } from './projected-spell.js';

describe('trusted projection receipts', () => {
    it('preserves projection semantics with collected and discarded receipts', () => {
        const normalize = createProjectedSpell();
        const input = { first_name: '  Ada  ', keep: 7, password_hash: 'secret' };

        expect(normalize.safeRun(input, { input: 'trusted' })).toEqual({
            changes: [
                expect.objectContaining({ from: ['first_name'], kind: 'rename', to: ['firstName'] }),
                expect.objectContaining({
                    from: ['password_hash'],
                    kind: 'rename',
                    to: ['passwordHash'],
                }),
                expect.objectContaining({ kind: 'trim', path: ['firstName'] }),
                expect.objectContaining({ kind: 'omit', path: ['passwordHash'] }),
            ],
            ok: true,
            value: { firstName: 'Ada', keep: 7 },
        });

        expect(normalize.safeRun(input, { input: 'trusted', receipt: 'discard' })).toEqual({
            changes: [],
            ok: true,
            value: { firstName: 'Ada', keep: 7 },
        });
    });

    it('keeps output key order independent of receipt collection', () => {
        const normalize = createProjectedSpell();
        const input = { first_name: 'Ada', keep: 7, password_hash: 'secret' };
        const collected = normalize.run(input, { input: 'trusted' });
        const discarded = normalize.run(input, { input: 'trusted', receipt: 'discard' });

        expect(Object.keys(discarded)).toEqual(Object.keys(collected));
        expect(Object.keys(discarded)).toEqual(['keep', 'firstName']);
    });
});
