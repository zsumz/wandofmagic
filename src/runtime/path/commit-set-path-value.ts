import type { DataRecord } from '../../core/execution/data-record.js';
import type { WandIssue } from '../../core/issue/issue-types.js';
import type { FieldPath } from '../../core/path/path.js';
import { defineContainerField } from '../clone-path-container/define-container-field.js';
import { setPathValue } from './set-path-value.js';

export type PathSetCommitResult =
    | { readonly changed: boolean; readonly ok: true }
    | { readonly issue: WandIssue; readonly ok: false };

/** Atomically commit one set into a private writable execution snapshot. */
export function commitSetPathValue(
    root: DataRecord,
    path: FieldPath,
    value: unknown,
): PathSetCommitResult {
    const result = setPathValue(root, path, value);
    if (!result.ok || !result.changed) {
        return result.ok ? { changed: false, ok: true } : result;
    }
    const rootKey = path[0];
    defineContainerField(root, rootKey, result.value[rootKey]);
    return { changed: true, ok: true };
}
