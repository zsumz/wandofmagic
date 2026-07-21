import { describe, expect, it } from 'vitest';
import { coerceActive } from '../../../../../scripts/benchmarks/flat/mappers/handwritten/coerce-active.mts';
import { coerceAge } from '../../../../../scripts/benchmarks/flat/mappers/handwritten/coerce-age.mts';
import { deriveName } from '../../../../../scripts/benchmarks/flat/mappers/handwritten/derive-name.mts';
import {
    applyRename,
    assertNoRenameConflict,
} from '../../../../../scripts/benchmarks/flat/mappers/handwritten/rename-fields.mts';
import { trimFields } from '../../../../../scripts/benchmarks/flat/mappers/handwritten/trim-fields.mts';

describe('handwritten benchmark reference operations', () => {
    it('trims the reference fields after validating them', () => {
        const value = { email: ' email ', firstName: ' Ada ', lastName: ' Lovelace ' };

        trimFields(value);

        expect(value).toEqual({ email: 'email', firstName: 'Ada', lastName: 'Lovelace' });
    });

    it('rejects a non-string trim field', () => {
        expect(() => {
            trimFields({ email: 7 });
        }).toThrow(
            'Cannot trim email; expected a string, null, or undefined.',
        );
    });

    it('derives the display name from both dependencies', () => {
        const value: Record<string, unknown> = { firstName: 'Ada', lastName: 'Lovelace' };

        deriveName(value);

        expect(value['displayName']).toBe('Ada Lovelace');
    });

    it('coerces the age and active reference fields', () => {
        const value: Record<string, unknown> = { active: 'TRUE', age: '37' };

        coerceAge(value);
        coerceActive(value);

        expect(value).toEqual({ active: true, age: 37 });
    });

    it('rejects a fractional age for the integer coercer', () => {
        expect(() => {
            coerceAge({ age: '37.5' });
        }).toThrow('Expected an integer.');
    });

    it('applies a present rename source', () => {
        const snapshot: Record<string, unknown> = {};

        applyRename(snapshot, { first_name: 'Ada' }, { first_name: true }, 'first_name', 'firstName');

        expect(snapshot).toEqual({ firstName: 'Ada' });
    });

    it('rejects a rename destination conflict', () => {
        expect(() => {
            assertNoRenameConflict(
                { firstName: true, first_name: true },
                'first_name',
                'firstName',
            );
        }).toThrow('Cannot rename first_name to firstName; the destination already exists.');
    });
});
