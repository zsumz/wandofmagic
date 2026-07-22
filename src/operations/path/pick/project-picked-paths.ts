import type { DataRecord } from '../../../core/execution/data-record.js';
import type { WandIssue } from '../../../core/issue/issue-types.js';
import type { FieldPath } from '../../../core/path/path.js';
import {
    createDataRecord,
    getObjectPrototype,
} from '../../../internal/type-boundary/record.js';
import { readPath } from '../../../runtime/path/read-path.js';
import { setPathValue } from '../../../runtime/path/set-path-value.js';

export type PickProjectionResult =
    | { readonly ok: true; readonly value: DataRecord }
    | { readonly issue: WandIssue; readonly ok: false };

export function projectPickedPaths(
    source: DataRecord,
    paths: readonly FieldPath[],
): PickProjectionResult {
    let projected = createDataRecord(getObjectPrototype(source));
    for (const path of paths) {
        const read = readPath(source, path);
        if (read.status === 'failed') {
            return { issue: read.issue, ok: false };
        }
        if (read.status === 'missing') {
            continue;
        }
        const written = setPathValue(projected, path, read.value);
        if (!written.ok) {
            return written;
        }
        projected = written.value;
    }
    return { ok: true, value: projected };
}
