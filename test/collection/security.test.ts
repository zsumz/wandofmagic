import { describe, expect, it } from 'vitest';

import { collection, spell } from '../../src/index.js';

describe('root collection input safety', () => {
    it('rejects non-arrays and array subclasses', () => {
        const normalize = collection(spell<{ value: string }>().build());

        expect(normalize.safeRun({} as never)).toMatchObject({
            issues: [{ code: 'invalid_input' }],
            ok: false,
        });
        class Items extends Array<{ value: string }> {}
        expect(normalize.safeRun(new Items())).toMatchObject({
            issues: [{ code: 'invalid_input' }],
            ok: false,
        });
    });

    it('rejects index accessors without executing them', () => {
        let reads = 0;
        const input: Array<{ value: string }> = [];
        Object.defineProperty(input, '0', {
            enumerable: true,
            get() {
                reads += 1;
                return { value: 'secret' };
            },
        });

        const result = collection(spell<{ value: string }>().build()).safeRun(input);

        expect(result).toMatchObject({
            issues: [{ code: 'unsupported_accessor', path: [0] }],
            ok: false,
        });
        expect(reads).toBe(0);
    });

    it('rejects custom enumerable fields and symbols', () => {
        const normalize = collection(spell<{ value: string }>().build());
        const named: Array<{ value: string }> = [];
        Object.defineProperty(named, 'metadata', { enumerable: true, value: 'private' });
        expect(normalize.safeRun(named)).toMatchObject({
            issues: [{ code: 'invalid_input' }],
            ok: false,
        });

        const symbol = Symbol('private');
        const symbolic: Array<{ value: string }> = [];
        Object.defineProperty(symbolic, symbol, { enumerable: true, value: 'private' });
        expect(normalize.safeRun(symbolic)).toMatchObject({
            issues: [{ code: 'invalid_input' }],
            ok: false,
        });
    });

    it('keeps checked and trusted outputs equivalent for proven arrays', () => {
        const normalize = collection(
            spell<{ value: string }>().transform('value', (value) => value.toUpperCase()).build(),
        );
        const input = [{ value: 'safe' }];
        expect(normalize.run(input, { input: 'checked' }))
            .toEqual(normalize.run(input, { input: 'trusted' }));
    });
});
