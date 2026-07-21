import { describe, expect, it } from 'vitest';
import { createProjectedSpell } from './projected-spell.js';

describe('trusted projection data model', () => {
    it('preserves null prototypes and treats __proto__ as an ordinary own field', () => {
        const normalize = createProjectedSpell();
        const input = Object.assign(Object.create(null), {
            first_name: '  Ada  ',
            keep: 7,
            password_hash: 'secret',
        }) as {
            first_name: string;
            keep: number;
            password_hash: string;
        };
        Object.defineProperty(input, '__proto__', {
            configurable: true,
            enumerable: true,
            value: { polluted: true },
            writable: true,
        });

        const output = normalize.run(input, { input: 'trusted', receipt: 'discard' });
        expect(Object.getPrototypeOf(output)).toBeNull();
        expect(Object.getOwnPropertyDescriptor(output, '__proto__')?.value).toEqual({
            polluted: true,
        });
        expect(Object.prototype).not.toHaveProperty('polluted');
    });
});
