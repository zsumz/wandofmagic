import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('deep move sparse destinations', () => {
    it('moves null values while creating missing destination parents', () => {
        const output = spell<{ source: null; items?: Array<{ label?: null }> }>()
            .move('source', ['items', 2, 'label'])
            .build()
            .run({ source: null });

        expect('source' in output).toBe(false);
        expect(output.items).toHaveLength(3);
        expect(0 in output.items).toBe(false);
        expect(1 in output.items).toBe(false);
        expect(output.items[2]).toEqual({ label: null });
    });
});
