import type { DataRecord } from '../../core/execution/data-record.js';
import type { FieldPath } from '../../core/path/path.js';
import { isUnknownArray } from '../../internal/type-boundary/array.js';
import { castInputRecord } from '../../internal/type-boundary/record.js';
import { inspectPathContainer } from '../path-container/inspect-path-container.js';
import { rootArrayMutationIssue } from './path-operation-issues.js';
import { deleteFromContainer } from '../path-mutation/delete-from-container.js';
import type { PathMutationResult } from '../path-mutation/mutation-result.js';

export type PathDeleteResult = PathMutationResult;

/** Atomically delete one normalized path without shifting sparse or dense array indices. */
export function deletePathValue(root: DataRecord, path: FieldPath): PathDeleteResult {
    const inspected = inspectPathContainer(root, path, 0);
    if (!inspected.ok) {
        return inspected;
    }
    if (isUnknownArray(inspected.value)) {
        return { issue: rootArrayMutationIssue(path), ok: false };
    }
    const result = deleteFromContainer(inspected.value, path, 0, new Set([root]));
    return result.ok
        ? { changed: result.changed, ok: true, value: castInputRecord(result.value) }
        : result;
}
