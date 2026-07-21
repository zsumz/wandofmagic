import type { WandIssue } from '../../../core/issue/issue-types.js';
import type { FieldPath } from '../../../core/path/path.js';
import {
    invokeTransform,
    isPromiseLike,
    type ErasedTransform,
} from '../../../internal/type-boundary/callback.js';
import {
    asyncTransformPathIssue,
    thrownTransformPathIssue,
} from './transform-path-issues.js';

type PathTransformResult =
    | { readonly issue: WandIssue; readonly ok: false }
    | { readonly ok: true; readonly value: unknown };

export function runPathTransform(
    transform: ErasedTransform,
    current: unknown,
    path: FieldPath,
    id: string,
): PathTransformResult {
    try {
        const value = invokeTransform(transform, current);
        return isPromiseLike(value)
            ? { issue: asyncTransformPathIssue(path, id), ok: false }
            : { ok: true, value };
    } catch (cause) {
        return { issue: thrownTransformPathIssue(cause, path, id), ok: false };
    }
}
