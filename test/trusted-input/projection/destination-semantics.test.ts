import { describe, expect, it } from 'vitest';
import { createProjectedSpell } from './projected-spell.js';

describe('trusted projection destinations', () => {
    it('detects projected destination conflicts in both receipt modes', () => {
        const normalize = createProjectedSpell();
        const input = { firstName: 'existing', first_name: 'incoming', keep: 7 };

        for (const receipt of ['collect', 'discard'] as const) {
            expect(normalize.safeRun(input, { input: 'trusted', receipt })).toMatchObject({
                issues: [{ code: 'destination_conflict', path: ['firstName'] }],
                ok: false,
            });
        }
    });

    it('handles an existing destination when its source is absent and reports direct omissions', () => {
        const normalize = createProjectedSpell();

        expect(normalize.safeRun(
            { firstName: '  Existing  ', keep: 7, passwordHash: 'remove-me' },
            { input: 'trusted' },
        )).toEqual({
            changes: [
                expect.objectContaining({ kind: 'trim', path: ['firstName'] }),
                expect.objectContaining({ kind: 'omit', path: ['passwordHash'] }),
            ],
            ok: true,
            value: { firstName: 'Existing', keep: 7 },
        });
    });
});
