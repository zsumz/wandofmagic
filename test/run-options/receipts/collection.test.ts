import { describe, expect, it } from 'vitest';
import { number } from '../../../src/coerce/index.js';
import { spell } from '../../../src/index.js';

describe('execution receipt collection', () => {
    it('collects applied changes by default and discards them explicitly', () => {
        const normalize = spell<{ count: string; label: string }>()
            .trim(['label'])
            .coerce('count', number({ integer: true }))
            .build();
        const input = { count: '7', label: '  widgets  ' };

        const collected = normalize.safeRun(input);
        expect(collected).toMatchObject({
            changes: [{ kind: 'trim' }, { kind: 'coerce' }],
            ok: true,
            value: { count: 7, label: 'widgets' },
        });
        expect(normalize.safeRun(input, {})).toEqual(collected);

        const discarded = normalize.safeRun(input, { receipt: 'discard' });
        expect(discarded).toEqual({
            changes: [],
            ok: true,
            value: { count: 7, label: 'widgets' },
        });
        expect(Object.isFrozen(discarded)).toBe(true);
        expect(Object.isFrozen(discarded.changes)).toBe(true);
        expect(input).toEqual({ count: '7', label: '  widgets  ' });
    });
});
