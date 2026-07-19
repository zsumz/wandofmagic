import { describe, expect, it } from 'vitest';
import { spell, WandError } from '../src/index.js';
import { defineCoercer } from '../src/coerce/index.js';

describe('runtime input snapshots', () => {
    it('rejects arrays at the root', () => {
        expect(spell<string[]>().build().safeRun([])).toMatchObject({
            issues: [{ code: 'invalid_input' }],
            ok: false,
        });
    });

    it('accepts null-prototype records and preserves their prototype', () => {
        const input = Object.create(null) as Record<string, unknown>;
        Object.defineProperty(input, 'value', {
            configurable: true,
            enumerable: true,
            value: 'kept',
            writable: true,
        });

        const result = spell<Record<string, unknown>>().build().run(input);
        expect(result).toEqual({ value: 'kept' });
        expect(Object.getPrototypeOf(result)).toBeNull();
    });

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

    it('classifies receipt value kinds without inspecting values', () => {
        const normalizeKind = defineCoercer<unknown, string>({
            name: 'kind-probe',
            run: () => ({ ok: true, value: 'normalized' }),
        });
        const normalize = spell<{ value: unknown }>().coerce('value', normalizeKind).build();

        for (const [input, expectedKind] of [
            [null, 'null'],
            [[], 'array'],
            [new Date('2026-01-01T00:00:00Z'), 'date'],
            [1, 'number'],
        ] as const) {
            const result = normalize.safeRun({ value: input });
            expect(result).toMatchObject({
                changes: [{ fromType: expectedKind, kind: 'coerce', toType: 'string' }],
                ok: true,
            });
        }
    });
});

describe('throwing execution errors', () => {
    it('serializes WandError without losing its structured receipt', () => {
        const result = spell<{ value?: string }>()
            .transform('value', (value) => value)
            .build()
            .safeRun({});
        if (result.ok) {
            throw new Error('Expected a failure fixture.');
        }

        const error = new WandError(result);
        expect(error.toJSON()).toEqual({
            changes: [],
            issues: result.issues,
            message: result.issues[0]?.message,
            name: 'WandError',
        });
    });

    it('uses a stable fallback message for an empty failure', () => {
        const error = new WandError({ changes: [], issues: [], ok: false });
        expect(error.message).toBe('Wandofmagic could not transform the value.');
    });
});
