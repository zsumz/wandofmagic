import { describe, expect, it } from 'vitest';
import {
    boolean,
    number,
} from '../../../src/coerce/index.js';
import { spell } from '../../../src/index.js';

describe('coercer construction snapshots', () => {
    it('captures built-in option values once', () => {
        const numberOptions: { integer?: boolean } = { integer: true };
        const integer = number(numberOptions);
        numberOptions.integer = false;
        expect(integer.run('1.5')).toMatchObject({ ok: false });

        const booleanOptions: { caseSensitive?: boolean } = { caseSensitive: true };
        const strictBoolean = boolean(booleanOptions);
        booleanOptions.caseSensitive = false;
        expect(strictBoolean.run('TRUE')).toMatchObject({ ok: false });
    });

    it('captures a custom coercer name and implementation when the step is created', () => {
        const mutable = {
            name: 'stable-coercer',
            run: (value: unknown) => ({ ok: true as const, value: `${String(value)}!` }),
        };
        const normalize = spell<{ value: string }>().coerce('value', mutable).build();
        mutable.name = 'mutated-coercer';
        mutable.run = () => ({ ok: true as const, value: 'mutated' });

        expect(normalize.safeRun({ value: 'original' })).toMatchObject({
            changes: [{ coercer: 'stable-coercer' }],
            ok: true,
            value: { value: 'original!' },
        });
    });
});
