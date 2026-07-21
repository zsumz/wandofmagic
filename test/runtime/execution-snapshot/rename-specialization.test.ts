import { describe, expect, it } from 'vitest';
import { spell } from '../../../src/index.js';

describe('rename execution specialization', () => {
    it('renames sparse records consistently across small-map specialization boundaries', () => {
        for (const fieldCount of [31, 32]) {
            const mapping: Record<string, string> = {};
            for (let index = 0; index < fieldCount; index += 1) {
                mapping[`source_${String(index)}`] = `target_${String(index)}`;
            }
            const lastIndex = fieldCount - 1;
            const normalize = spell<Record<string, number>>().rename(mapping as never).build();
            const input = { source_0: 0, [`source_${String(lastIndex)}`]: lastIndex };

            expect(normalize.safeRun(input)).toMatchObject({
                changes: [
                    { from: ['source_0'], kind: 'rename', to: ['target_0'] },
                    {
                        from: [`source_${String(lastIndex)}`],
                        kind: 'rename',
                        to: [`target_${String(lastIndex)}`],
                    },
                ],
                ok: true,
                value: { target_0: 0, [`target_${String(lastIndex)}`]: lastIndex },
            });
            expect(input).toEqual({
                source_0: 0,
                [`source_${String(lastIndex)}`]: lastIndex,
            });
        }
    });
});
