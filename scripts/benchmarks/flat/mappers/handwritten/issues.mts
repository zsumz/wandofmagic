import {
    WandError,
    type StepKind,
    type WandFailure,
    type FieldPath,
    type WandIssue,
    type WandIssueCode,
} from '../../../../../dist/index.js';

const emptyChanges = Object.freeze([]);

interface IssueInput {
    readonly cause?: unknown;
    readonly code: WandIssueCode;
    readonly details?: Readonly<Record<string, unknown>>;
    readonly id?: string;
    readonly kind?: StepKind;
    readonly message: string;
    readonly path?: string;
}

export function throwCoercionFailure(
    path: string,
    coercer: string,
    id: string,
    message: string,
): never {
    return throwIssue({
        code: 'coercion_failed',
        details: { coercer },
        id,
        kind: 'coerce',
        message,
        path,
    });
}

export function throwInvalidInput(cause: unknown): never {
    return throwIssue({
        cause,
        code: 'invalid_input',
        message: 'Wandofmagic could not inspect the input record.',
    });
}

export function throwIssue(input: IssueInput): never {
    const path = input.path === undefined ? undefined : createFieldPath(input.path);
    const issue: WandIssue = Object.freeze({
        ...input.cause === undefined ? {} : { cause: input.cause },
        code: input.code,
        message: input.message,
        ...input.details === undefined ? {} : { details: Object.freeze(input.details) },
        ...path === undefined ? {} : { path },
        ...input.id === undefined || input.kind === undefined
            ? {}
            : { step: Object.freeze({ id: input.id, kind: input.kind }) },
    });
    const failure: WandFailure = Object.freeze({
        changes: emptyChanges,
        issues: Object.freeze([issue]),
        ok: false,
    });
    throw new WandError(failure);
}

function createFieldPath(segment: string): FieldPath {
    return Object.freeze([segment]);
}
