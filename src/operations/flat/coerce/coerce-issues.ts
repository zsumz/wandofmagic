import type { CoerceFailure } from '../../../coerce/types.js';
import { createIssue } from '../../../core/issue/create-issue.js';
import type { WandIssue } from '../../../core/issue/issue-types.js';
import type { FieldPath } from '../../../core/path/path.js';

export function missingCoerceIssue(key: string, path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'missing_field',
        message: `Cannot coerce ${key}; the field is missing or undefined.`,
        path,
        step: { id, kind: 'coerce' },
    });
}

export function thrownCoerceIssue(
    cause: unknown,
    coercerName: string,
    key: string,
    path: FieldPath,
    id: string,
): WandIssue {
    return createIssue({
        cause,
        code: 'coercion_failed',
        details: { coercer: coercerName },
        message: `The ${coercerName} coercer threw while processing ${key}.`,
        path,
        step: { id, kind: 'coerce' },
    });
}

export function failedCoerceIssue(
    failure: CoerceFailure,
    coercerName: string,
    path: FieldPath,
    id: string,
): WandIssue {
    return createIssue({
        code: 'coercion_failed',
        details: {
            ...failure.code === undefined ? {} : { coercerCode: failure.code },
            coercer: coercerName,
        },
        message: failure.message,
        path,
        step: { id, kind: 'coerce' },
    });
}
