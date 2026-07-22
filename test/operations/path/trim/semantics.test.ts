import { describe, expect, it } from 'vitest';

import { spell, wand } from '../../../../src/index.js';

describe('deep trim semantics', () => {
    it('trims selected nested strings and preserves sparse arrays', () => {
        const rows: Array<{ label: string }> = [];
        rows.length = 3;
        rows[2] = { label: '  third  ' };
        const result = spell<{
            profile: { name: string; untouched: string };
            rows: Array<{ label: string }>;
        }>()
            .trim([['profile', 'name'], ['rows', 2, 'label']])
            .build()
            .safeRun({ profile: { name: '  Ada  ', untouched: '  kept  ' }, rows });

        expect(result).toMatchObject({
            changes: [
                { kind: 'trim', path: ['profile', 'name'] },
                { kind: 'trim', path: ['rows', 2, 'label'] },
            ],
            ok: true,
            value: {
                profile: { name: 'Ada', untouched: '  kept  ' },
            },
        });
        if (!result.ok) {
            throw new Error('Expected deep trim to succeed.');
        }
        expect(0 in result.value.rows).toBe(false);
        expect(1 in result.value.rows).toBe(false);
        expect(result.value.rows[2]).toEqual({ label: 'third' });
    });

    it('skips missing, null, and undefined paths', () => {
        const normalize = spell<{
            profile?: { alias?: string | null };
            stable: string;
        }>().trim([['profile', 'alias']]).build();
        expect(normalize.safeRun({ profile: { alias: null }, stable: 'stable' }))
            .toMatchObject({ changes: [], ok: true });
        expect(normalize.safeRun({ stable: 'stable' }))
            .toMatchObject({ changes: [], ok: true });

        expect(wand({ profile: { alias: ' value ' } })
            .trim([['profile', 'alias']])
            .value()).toEqual({ profile: { alias: 'value' } });
    });

    it('keeps the existing flat batch syntax unambiguous', () => {
        expect(spell<{ first: string; last: string }>()
            .trim(['first', 'last'])
            .build()
            .run({ first: ' Ada ', last: ' Lovelace ' }))
            .toEqual({ first: 'Ada', last: 'Lovelace' });
    });
});
