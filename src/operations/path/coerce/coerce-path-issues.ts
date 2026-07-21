import type { CoerceFailure } from '../../../coerce/types.js';
import { createIssue } from '../../../core/issue/create-issue.js';
import type { WandIssue } from '../../../core/issue/issue-types.js';
import type { FieldPath } from '../../../core/path/path.js';

export function missingCoercePathIssue(path: FieldPath, id: string): WandIssue {
    return createIssue({
        code: 'missing_field',
        message: 'Cannot coerce the selected path; it is missing or undefined.',
        path,
        step: { id, kind: 'coerce' },
    });
}

export function thrownCoercePathIssue(
    cause: unknown,
    coercerName: string,
    path: FieldPath,
    id: string,
): WandIssue {
    return createIssue({
        cause,
        code: 'coercion_failed',
        details: { coercer: coercerName },
        message: `The ${coercerName} coercer threw while processing the selected path.`,
        path,
        step: { id, kind: 'coerce' },
    });
}

export function failedCoercePathIssue(
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
