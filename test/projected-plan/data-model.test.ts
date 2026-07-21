import { describe, expect, it } from 'vitest';
import { spell } from '../../src/index.js';

describe('ahead-of-time structural projection data-model safety', () => {
    it('validates every descriptor before reporting a projected operation issue', () => {
        let getterCalls = 0;
        const input = Object.defineProperty(
            { first_name: 'Ada', firstName: 'Grace' },
            'removable',
            {
                enumerable: true,
                get() {
                    getterCalls += 1;
                    return true;
                },
            },
        );
        const normalize = spell<{
            first_name: string;
            firstName?: string;
            removable?: boolean;
        }>()
            .rename({ first_name: 'firstName' })
            .omit(['removable'])
            .build();

        expect(normalize.safeRun(input)).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['removable'] }],
            ok: false,
        });
        expect(getterCalls).toBe(0);
    });

    it('preserves null prototypes in projected outputs', () => {
        const normalize = spell<{ removable: string; source: string }>()
            .rename({ source: 'target' })
            .omit(['removable'])
            .build();
        const input = Object.create(null) as { removable: string; source: string };
        input.removable = 'remove me';
        input.source = 'kept';

        const result = normalize.safeRun(input);
        expect(result).toMatchObject({ ok: true, value: { target: 'kept' } });
        if (result.ok) {
            expect(Object.getPrototypeOf(result.value)).toBeNull();
        }
    });
});
