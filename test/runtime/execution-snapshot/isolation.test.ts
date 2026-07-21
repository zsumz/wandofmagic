import { describe, expect, it } from 'vitest';
import { number } from '../../../src/coerce/index.js';
import { spell } from '../../../src/index.js';

describe('execution snapshot isolation', () => {
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
});
