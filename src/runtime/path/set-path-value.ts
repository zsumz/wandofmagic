import type { DataRecord } from '../../core/execution/data-record.js';
import type { FieldPath } from '../../core/path/path.js';
import { isUnknownArray } from '../../internal/type-boundary/array.js';
import { castInputRecord } from '../../internal/type-boundary/record.js';
import { inspectPathContainer } from '../path-container/inspect-path-container.js';
import { rootArrayMutationIssue } from './path-operation-issues.js';
import type { PathMutationResult } from '../path-mutation/mutation-result.js';
import { setContainer } from '../path-mutation/set-container.js';

export type PathSetResult = PathMutationResult;

/** Atomically set one normalized path by cloning only containers along its branch. */
export function setPathValue(
    root: DataRecord,
    path: FieldPath,
    value: unknown,
): PathSetResult {
    const inspected = inspectPathContainer(root, path, 0);
    if (!inspected.ok) {
        return inspected;
    }
    if (isUnknownArray(inspected.value)) {
        return { issue: rootArrayMutationIssue(path), ok: false };
    }
    const result = setContainer(inspected.value, path, 0, value, new Set([root]));
    return result.ok
        ? { changed: result.changed, ok: true, value: castInputRecord(result.value) }
        : result;
}
