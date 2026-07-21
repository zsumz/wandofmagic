import { throwCoercionFailure, throwIssue } from './issues.mts';
import { hasOwn } from './record-fields.mts';

const decimalNumber = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export function coerceAge(value: Record<string, unknown>): void {
    const current = hasOwn(value, 'age') ? value['age'] : undefined;
    if (current === undefined) {
        throwIssue({
            code: 'missing_field',
            id: 'coerce:3',
            kind: 'coerce',
            message: 'Cannot coerce age; the field is missing or undefined.',
            path: 'age',
        });
    }
    if (typeof current !== 'number' && typeof current !== 'string') {
        throwCoercionFailure('age', 'integer', 'coerce:3', 'Expected a number or decimal string.');
    }
    if (typeof current === 'string' && !decimalNumber.test(current.trim())) {
        throwCoercionFailure('age', 'integer', 'coerce:3', 'Expected an explicit decimal number.');
    }
    const converted = typeof current === 'number' ? current : Number(current);
    if (!Number.isFinite(converted)) {
        throwCoercionFailure('age', 'integer', 'coerce:3', 'Expected a finite number.');
    }
    if (!Number.isInteger(converted)) {
        throwCoercionFailure('age', 'integer', 'coerce:3', 'Expected an integer.');
    }
    value['age'] = converted;
}
