import { boolean } from '../../../src/coerce/builtin/boolean.js';
import { isoDate } from '../../../src/coerce/builtin/iso-date.js';
import { number } from '../../../src/coerce/builtin/number.js';
import { string } from '../../../src/coerce/builtin/string.js';
import { defineCoercer } from '../../../src/coerce/types.js';
import { spell } from '../../../src/builder/spell/spell.js';

interface OperationInput {
    readonly count?: number | string;
    readonly custom: string;
    readonly date: Date | string;
    readonly fallback?: number;
    readonly flag?: boolean | string;
    readonly secret: string;
    readonly source: string;
    readonly text: bigint | boolean | number | string;
}

const custom = defineCoercer<string, string>({
    name: 'uppercase',
    run(value) {
        return value === 'invalid'
            ? { code: 'invalid_custom', message: 'Custom value is invalid.', ok: false }
            : { ok: true, value: String(value).toUpperCase() };
    },
});

export const operationConformanceSpell = spell<OperationInput>()
    .rename({ source: 'value' })
    .trim(['value'])
    .coerce('count', number({ integer: true }), { missing: 'skip' })
    .coerce('flag', boolean({ caseSensitive: true }), { missing: 'skip' })
    .coerce('text', string())
    .coerce('date', isoDate())
    .coerce('custom', custom)
    .transform('value', (value) => {
        if (value === 'throw') {
            throw new Error('callback failure');
        }
        return value.toUpperCase();
    })
    .default('fallback', 5)
    .derive('summary', ['value', 'custom'], ([value, customValue]) =>
        `${value}:${customValue}`)
    .omit(['secret'])
    .build();

const valid: OperationInput = {
    count: '7',
    custom: 'ada',
    date: '2026-07-20T12:00:00Z',
    flag: 'true',
    secret: 'hidden',
    source: ' value ',
    text: 42,
};

export const operationConformanceInputs: readonly OperationInput[] = [
    valid,
    { ...valid, count: '7.5' },
    { ...valid, custom: 'invalid' },
    { ...valid, date: 'not-a-date' },
    { ...valid, flag: 'TRUE' },
    { ...valid, source: 'throw' },
];
