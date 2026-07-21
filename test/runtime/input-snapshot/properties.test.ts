import { describe, expect, it } from 'vitest';
import { spell } from '../../../src/index.js';

describe('runtime input properties', () => {
    it('rejects enumerable symbols', () => {
        const input = { [Symbol('secret')]: 'value' } as Record<string, unknown>;

        expect(spell<Record<string, unknown>>().build().safeRun(input)).toMatchObject({
            issues: [{ code: 'invalid_input' }],
            ok: false,
        });
    });

    it('ignores non-enumerable properties and inconsistent proxy descriptors', () => {
        const input = Object.defineProperty({ visible: 'yes' }, 'hidden', {
            enumerable: false,
            value: 'no',
        });
        Object.defineProperty(input, Symbol('hidden'), {
            enumerable: false,
            value: 'also no',
        });
        expect(spell<Record<string, unknown>>().build().run(input)).toEqual({ visible: 'yes' });

        const proxy = new Proxy(
            {},
            {
                getOwnPropertyDescriptor: () => undefined,
                ownKeys: () => ['ghost'],
            },
        );
        expect(spell<Record<string, unknown>>().build().run(proxy)).toEqual({});
    });
});
