import { describe, expect, it } from 'vitest';
import { spell } from '../src/index.js';
import { defineCoercer } from '../src/coerce/index.js';

describe('absent, undefined, and null semantics', () => {
    it('renames present undefined and null fields while skipping absent fields', () => {
        const normalize = spell<{
            absent?: string;
            nullValue: null;
            undefinedValue: string | undefined;
        }>()
            .rename({
                absent: 'renamedAbsent',
                nullValue: 'renamedNull',
                undefinedValue: 'renamedUndefined',
            })
            .build();

        expect(normalize.run({ nullValue: null, undefinedValue: undefined })).toEqual({
            renamedNull: null,
            renamedUndefined: undefined,
        });
    });

    it('passes null to coercers and transforms but treats undefined as missing', () => {
        const nullCoercer = defineCoercer<null, 'coerced-null'>({
            name: 'null-probe',
            run: (value) =>
                value === null
                    ? { ok: true, value: 'coerced-null' }
                    : { message: 'Expected null.', ok: false },
        });
        const coerceNull = spell<{ value: null }>().coerce('value', nullCoercer).build();
        expect(coerceNull.run({ value: null })).toEqual({ value: 'coerced-null' });

        const transformNull = spell<{ value: null }>()
            .transform('value', (value) => `transformed-${String(value)}`)
            .build();
        expect(transformNull.run({ value: null })).toEqual({ value: 'transformed-null' });

        const required = spell<{ value?: string | undefined }>()
            .transform('value', (value) => value)
            .build();
        expect(required.safeRun({ value: undefined })).toMatchObject({
            issues: [{ code: 'missing_field' }],
            ok: false,
        });

        const skipped = spell<{ value?: string | undefined }>()
            .transform('value', (value) => value, { missing: 'skip' })
            .build();
        expect(skipped.run({ value: undefined })).toEqual({ value: undefined });
    });

    it('passes null derive dependencies and rejects undefined dependencies', () => {
        const deriveNull = spell<{ source: null }>()
            .derive('derived', ['source'], ([source]) => String(source))
            .build();
        expect(deriveNull.run({ source: null })).toEqual({ derived: 'null', source: null });

        const deriveUndefined = spell<{ source: string | undefined }>()
            .derive('derived', ['source'], ([source]) => source)
            .build();
        expect(deriveUndefined.safeRun({ source: undefined })).toMatchObject({
            issues: [{ code: 'missing_field' }],
            ok: false,
        });
    });

    it('omits own undefined and null fields', () => {
        const omit = spell<{ nullValue: null; undefinedValue: undefined }>()
            .omit(['nullValue', 'undefinedValue'])
            .build();

        expect(omit.run({ nullValue: null, undefinedValue: undefined })).toEqual({});
    });
});
