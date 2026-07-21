import { describe, expect, it } from 'vitest';
import { spell, wand } from '../../../../src/index.js';

describe('deep set composition', () => {
    it('creates missing parents and sparse arrays, and composes with flat operations', () => {
        const output = spell<{ id: string }>()
            .set(['order', 'items', 3, 'sku'], 'ABC')
            .set('active', false)
            .build()
            .run({ id: 'order-1' });

        expect(output).toMatchObject({ active: false, id: 'order-1' });
        expect(output.order.items).toHaveLength(4);
        expect(output.order.items[3]).toEqual({ sku: 'ABC' });
        expect(0 in output.order.items).toBe(false);
        expect(wand({}).set('label', '  ready  ').trim(['label']).value())
            .toEqual({ label: 'ready' });
    });
});
