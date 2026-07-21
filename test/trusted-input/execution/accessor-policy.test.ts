import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/index.js';

function createAccessorInput(onRead: () => void): { value: string } {
    return Object.defineProperty({}, 'value', {
        enumerable: true,
        get() {
            onRead();
            return '  trusted  ';
        },
    }) as { value: string };
}

describe('trusted input accessor policy', () => {
    it('keeps descriptor inspection as the default and makes trust explicit', () => {
        let reads = 0;
        const input = createAccessorInput(() => {
            reads += 1;
        });
        const normalize = spell<{ value: string }>().trim(['value']).build();

        expect(normalize.safeRun(input)).toMatchObject({
            issues: [{ code: 'unsupported_accessor' }],
            ok: false,
        });
        expect(reads).toBe(0);

        expect(normalize.safeRun(input, { input: 'trusted' })).toMatchObject({
            changes: [{ kind: 'trim' }],
            ok: true,
            value: { value: 'trusted' },
        });
        expect(reads).toBe(1);
    });
});
