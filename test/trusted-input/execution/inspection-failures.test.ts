import { describe, expect, it } from 'vitest';

import { spell, WandError } from '../../../src/index.js';

describe('trusted input inspection failures', () => {
    it('turns throwing input inspection traps into value-free structured failures', () => {
        const secret = 'proxy-secret-991';
        const input = new Proxy({}, {
            getPrototypeOf() {
                throw new Error(secret);
            },
        });
        const normalize = spell<Record<string, unknown>>().build();

        const result = normalize.safeRun(input);
        expect(result).toMatchObject({ issues: [{ code: 'invalid_input' }], ok: false });
        expect(JSON.stringify(result)).not.toContain(secret);

        expect(() => normalize.run(input)).toThrow(WandError);
    });

    it('returns a structured failure when a trusted property read throws', () => {
        const input = Object.defineProperty({}, 'value', {
            enumerable: true,
            get() {
                throw new Error('private getter detail');
            },
        }) as { value: string };

        const result = spell<{ value: string }>()
            .trim(['value'])
            .build()
            .safeRun(input, { input: 'trusted' });

        expect(result).toMatchObject({ issues: [{ code: 'invalid_input' }], ok: false });
        expect(JSON.stringify(result)).not.toContain('private getter detail');
    });
});
