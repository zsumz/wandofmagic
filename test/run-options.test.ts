import { describe, expect, it } from 'vitest';
import { spell, wand, WandError } from '../src/index.js';
import { number } from '../src/coerce/index.js';

describe('single-record execution options', () => {
    it('collects applied changes by default and discards them explicitly', () => {
        const normalize = spell<{ count: string; label: string }>()
            .trim(['label'])
            .coerce('count', number({ integer: true }))
            .build();
        const input = { count: '7', label: '  widgets  ' };

        const collected = normalize.safeRun(input);
        expect(collected).toMatchObject({
            changes: [{ kind: 'trim' }, { kind: 'coerce' }],
            ok: true,
            value: { count: 7, label: 'widgets' },
        });
        expect(normalize.safeRun(input, {})).toEqual(collected);

        const discarded = normalize.safeRun(input, { receipt: 'discard' });
        expect(discarded).toEqual({
            changes: [],
            ok: true,
            value: { count: 7, label: 'widgets' },
        });
        expect(Object.isFrozen(discarded)).toBe(true);
        expect(Object.isFrozen(discarded.changes)).toBe(true);
        expect(input).toEqual({ count: '7', label: '  widgets  ' });
    });

    it('stops on the first failing step and keeps only earlier collected changes', () => {
        let laterCalls = 0;
        const normalize = spell<{ count: string; first_name: string; later: string }>()
            .rename({ first_name: 'firstName' })
            .coerce('count', number())
            .transform('later', (value) => {
                laterCalls += 1;
                return value.toUpperCase();
            })
            .build();
        const input = { count: 'not-a-number', first_name: 'Ada', later: 'unreached' };

        const collected = normalize.safeRun(input);
        expect(collected).toMatchObject({
            changes: [{ kind: 'rename' }],
            issues: [{ code: 'coercion_failed' }],
            ok: false,
        });
        if (!collected.ok) {
            expect(collected.issues).toHaveLength(1);
        }

        const discarded = normalize.safeRun(input, { receipt: 'discard' });
        expect(discarded).toMatchObject({
            changes: [],
            issues: [{ code: 'coercion_failed' }],
            ok: false,
        });
        expect(laterCalls).toBe(0);

        try {
            normalize.run(input);
            throw new Error('Expected run() to fail.');
        } catch (error) {
            expect(error).toBeInstanceOf(WandError);
            if (error instanceof WandError) {
                expect(error.changes).toMatchObject([{ kind: 'rename' }]);
                expect(error.issues).toHaveLength(1);
            }
        }

        try {
            normalize.run(input, { receipt: 'discard' });
            throw new Error('Expected run() with discarded receipts to fail.');
        } catch (error) {
            expect(error).toBeInstanceOf(WandError);
            if (error instanceof WandError) {
                expect(error.changes).toEqual([]);
            }
        }
    });

    it('validates receipt policies for unsafe JavaScript callers', () => {
        const identity = spell<Record<string, unknown>>().build();

        expect(() => identity.safeRun({}, null as never)).toThrow(
            new TypeError('RunOptions must be an object.'),
        );
        expect(() => identity.safeRun({}, { receipt: 'retain' } as never)).toThrow(
            new TypeError('RunOptions.receipt must be either "collect" or "discard".'),
        );
        expect(() => identity.safeRun({}, { input: 'assumed' } as never)).toThrow(
            new TypeError('RunOptions.input must be either "checked" or "trusted".'),
        );

        let getterCalls = 0;
        const accessorOptions = Object.defineProperty({}, 'receipt', {
            enumerable: true,
            get() {
                getterCalls += 1;
                return 'discard';
            },
        });
        expect(() => identity.safeRun({}, accessorOptions)).toThrow(
            new TypeError('RunOptions.receipt must be a data property.'),
        );
        expect(getterCalls).toBe(0);

        const inputAccessorOptions = Object.defineProperty({}, 'input', {
            enumerable: true,
            get() {
                getterCalls += 1;
                return 'trusted';
            },
        });
        expect(() => identity.safeRun({}, inputAccessorOptions)).toThrow(
            new TypeError('RunOptions.input must be a data property.'),
        );
        expect(getterCalls).toBe(0);
    });

    it('only caches frozen option objects and observes mutations to ordinary objects', () => {
        const normalize = spell<{ label: string }>().trim(['label']).build();
        const options: { receipt: 'collect' | 'discard' } = { receipt: 'discard' };

        expect(normalize.safeRun({ label: '  first  ' }, options)).toMatchObject({
            changes: [],
            ok: true,
        });

        options.receipt = 'collect';
        expect(normalize.safeRun({ label: '  second  ' }, options)).toMatchObject({
            changes: [{ kind: 'trim' }],
            ok: true,
        });

        const frozen = Object.freeze({ input: 'trusted', receipt: 'discard' } as const);
        expect(normalize.run({ label: '  fast  ' }, frozen)).toEqual({ label: 'fast' });
        expect(normalize.run({ label: '  again  ' }, frozen)).toEqual({ label: 'again' });
    });

    it('discards receipts for every vertical-slice operation through the one-off API', () => {
        const result = wand({ count: '2', first_name: ' Ada ', removable: true })
            .rename({ first_name: 'firstName' })
            .trim(['firstName'])
            .coerce('count', number({ integer: true }))
            .transform('count', (count) => count * 2)
            .default('active', false as const)
            .derive('label', ['firstName', 'count'], ([firstName, count]) =>
                `${firstName}:${String(count)}`)
            .omit(['removable'])
            .result({ receipt: 'discard' });

        expect(result).toEqual({
            changes: [],
            ok: true,
            value: {
                active: false,
                count: 4,
                firstName: 'Ada',
                label: 'Ada:4',
            },
        });
    });

    it('keeps failed-result diagnostics free of input values in both receipt modes', () => {
        const secret = 'customer-secret-719';
        const invalidCount = 'invalid-count-313';
        const normalize = spell<{ count: string; secret: string }>()
            .rename({ secret: 'credential' })
            .coerce('count', number())
            .build();
        const input = { count: invalidCount, secret };

        for (const receipt of ['collect', 'discard'] as const) {
            const serialized = JSON.stringify(normalize.safeRun(input, { receipt }));
            expect(serialized).not.toContain(secret);
            expect(serialized).not.toContain(invalidCount);
        }

        try {
            normalize.run(input);
            throw new Error('Expected run() to fail.');
        } catch (error) {
            expect(error).toBeInstanceOf(WandError);
            expect(JSON.stringify(error)).not.toContain(secret);
            expect(JSON.stringify(error)).not.toContain(invalidCount);
        }
    });
});
