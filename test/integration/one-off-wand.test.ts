import { describe, expect, it } from 'vitest';
import { number } from '../../src/coerce/index.js';
import { wand } from '../../src/index.js';

describe('one-off wand integration', () => {
    it('normalizes a compact input', () => {
        const output = wand({ count: '7', label: '  widgets  ' })
            .trim(['label'])
            .coerce('count', number({ integer: true }))
            .value();

        expect(output).toEqual({ count: 7, label: 'widgets' });
    });
});
