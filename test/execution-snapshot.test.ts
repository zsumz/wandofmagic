import { describe, expect, it } from 'vitest';
import { spell } from '../src/index.js';
import { number } from '../src/coerce/index.js';

describe('runtime-owned execution snapshots', () => {
    it('executes a 100-step compiled plan without losing order or receipts', () => {
        let builder = spell<{ value: string }>();
        for (let index = 0; index < 100; index += 1) {
            builder = builder.trim(['value']);
        }

        const result = builder.build().safeRun({ value: '  stable  ' });
        expect(result).toMatchObject({
            changes: [{ kind: 'trim', stepId: 'trim:1' }],
            ok: true,
            value: { value: 'stable' },
        });
    });

    it('updates only the private snapshot across a complete plan', () => {
        const normalize = spell<{
            count: string;
            first_name: string;
            removable: boolean;
        }>()
            .rename({ first_name: 'firstName' })
            .trim(['firstName'])
            .coerce('count', number({ integer: true }))
            .transform('count', (count) => count * 2)
            .default('active', false as const)
            .derive('label', ['firstName', 'count'], ([firstName, count]) =>
                `${firstName}:${String(count)}`)
            .omit(['removable'])
            .build();
        const input = Object.freeze({ count: '2', first_name: ' Ada ', removable: true });

        const output = normalize.run(input);

        expect(output).not.toBe(input);
        expect(output).toEqual({
            active: false,
            count: 4,
            firstName: 'Ada',
            label: 'Ada:4',
        });
        expect(input).toEqual({ count: '2', first_name: ' Ada ', removable: true });
    });

    it('creates an independent snapshot for every execution', () => {
        const normalize = spell<{ label: string }>().trim(['label']).build();
        const input = { label: '  stable  ' };

        const first = normalize.run(input);
        expect(Object.getOwnPropertyDescriptor(first, 'label')).toMatchObject({
            configurable: true,
            enumerable: true,
            writable: true,
        });
        first.label = 'consumer mutation';
        const second = normalize.run(input);

        expect(second).toEqual({ label: 'stable' });
        expect(second).not.toBe(first);
        expect(input).toEqual({ label: '  stable  ' });
    });

    it('does not expose or report partial multi-field writes on failure', () => {
        const normalize = spell<{ first: string; second: string }>()
            .trim(['first', 'second'])
            .build();
        const input = { first: '  would-trim  ', second: 42 } as unknown as {
            first: string;
            second: string;
        };

        const result = normalize.safeRun(input);

        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'unexpected_type', path: ['second'] }],
            ok: false,
        });
        expect(input).toEqual({ first: '  would-trim  ', second: 42 });
    });

    it('renames sparse records consistently across small-map specialization boundaries', () => {
        for (const fieldCount of [31, 32]) {
            const mapping: Record<string, string> = {};
            for (let index = 0; index < fieldCount; index += 1) {
                mapping[`source_${String(index)}`] = `target_${String(index)}`;
            }
            const lastIndex = fieldCount - 1;
            const normalize = spell<Record<string, number>>().rename(mapping as never).build();
            const input = { source_0: 0, [`source_${String(lastIndex)}`]: lastIndex };

            expect(normalize.safeRun(input)).toMatchObject({
                changes: [
                    { from: ['source_0'], kind: 'rename', to: ['target_0'] },
                    {
                        from: [`source_${String(lastIndex)}`],
                        kind: 'rename',
                        to: [`target_${String(lastIndex)}`],
                    },
                ],
                ok: true,
                value: { target_0: 0, [`target_${String(lastIndex)}`]: lastIndex },
            });
            expect(input).toEqual({ source_0: 0, [`source_${String(lastIndex)}`]: lastIndex });
        }
    });
});
