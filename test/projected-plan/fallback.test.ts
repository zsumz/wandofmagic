import { describe, expect, it } from 'vitest';
import { spell } from '../../src/index.js';

describe('ahead-of-time structural projection fallback', () => {
    it('falls back when a middle step touches an omitted field', () => {
        const normalize = spell<{ removable: string; source: string }>()
            .rename({ source: 'target' })
            .trim(['removable'])
            .omit(['removable'])
            .build();
        const input = { removable: ' remove me ', source: 'kept' };

        const result = normalize.safeRun(input);
        expect(result).toMatchObject({
            changes: [
                { kind: 'rename' },
                { kind: 'trim' },
                { kind: 'omit' },
            ],
            ok: true,
            value: { target: 'kept' },
        });
    });

    it('matches fallback behavior across the 31-entry projection limit', () => {
        for (const fieldCount of [31, 32]) {
            const mapping: Record<string, string> = {};
            for (let index = 0; index < fieldCount; index += 1) {
                mapping[`source_${String(index)}`] = `target_${String(index)}`;
            }
            const lastIndex = fieldCount - 1;
            const normalize = spell<Record<string, number>>()
                .rename(mapping as never)
                .omit([`target_${String(lastIndex)}`] as never)
                .build();

            expect(normalize.safeRun({
                source_0: 0,
                [`source_${String(lastIndex)}`]: lastIndex,
            })).toMatchObject({
                changes: [
                    { kind: 'rename', to: ['target_0'] },
                    { kind: 'rename', to: [`target_${String(lastIndex)}`] },
                    { kind: 'omit', path: [`target_${String(lastIndex)}`] },
                ],
                ok: true,
                value: { target_0: 0 },
            });
        }
    });
});
