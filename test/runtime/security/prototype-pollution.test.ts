import { describe, expect, it } from 'vitest';

import { PlanError, spell } from '../../../src/index.js';

describe('runtime prototype-pollution safety', () => {
    it('rejects prototype-pollution path segments in plans', () => {
        expect(() => spell<{ safe: string }>().rename({ safe: '__proto__' } as never)).toThrow(
            PlanError,
        );
    });

    it('snapshots own dangerous input keys without changing the output prototype', () => {
        const input = Object.defineProperty({}, '__proto__', {
            enumerable: true,
            value: { polluted: true },
        });

        const output = spell<Record<string, unknown>>().build().run(input);

        expect(Object.getPrototypeOf(output)).toBe(Object.prototype);
        expect(Object.getOwnPropertyDescriptor(output, '__proto__')?.value).toEqual({
            polluted: true,
        });
        expect(Object.prototype).not.toHaveProperty('polluted');
    });
});
