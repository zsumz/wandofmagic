import { throwCoercionFailure } from './issues.mts';
import { hasOwn } from './record-fields.mts';

export function coerceActive(value: Record<string, unknown>): void {
    const current = hasOwn(value, 'active') ? value['active'] : undefined;
    if (current === undefined || typeof current === 'boolean') {
        return;
    }
    if (typeof current !== 'string') {
        throwCoercionFailure(
            'active',
            'boolean',
            'coerce:4',
            'Expected a boolean or boolean string.',
        );
    }
    const candidate = current.toLowerCase();
    if (candidate === 'true' || candidate === 'false') {
        value['active'] = candidate === 'true';
        return;
    }
    throwCoercionFailure(
        'active',
        'boolean',
        'coerce:4',
        'Expected the string "true" or "false".',
    );
}
