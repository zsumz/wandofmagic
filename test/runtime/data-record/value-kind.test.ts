import { describe, expect, it } from 'vitest';
import { defineCoercer } from '../../../src/coerce/index.js';
import { spell } from '../../../src/index.js';

describe('receipt value kinds', () => {
    it('classifies values without inspecting their contents', () => {
        const normalizeKind = defineCoercer<unknown, string>({
            name: 'kind-probe',
            run: () => ({ ok: true, value: 'normalized' }),
        });
        const normalize = spell<{ value: unknown }>().coerce('value', normalizeKind).build();

        for (const [input, expectedKind] of [
            [null, 'null'],
            [[], 'array'],
            [new Date('2026-01-01T00:00:00Z'), 'date'],
            [1, 'number'],
        ] as const) {
            const result = normalize.safeRun({ value: input });
            expect(result).toMatchObject({
                changes: [{ fromType: expectedKind, kind: 'coerce', toType: 'string' }],
                ok: true,
            });
        }
    });
});
