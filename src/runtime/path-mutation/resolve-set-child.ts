import type { WandIssue } from '../../core/issue/issue-types.js';
import type {
    FieldPath,
    PathSegment,
} from '../../core/path/path.js';
import { createDataRecord } from '../../internal/type-boundary/record.js';
import type { PathContainer } from '../path-container/container-types.js';
import { inspectPathContainer } from '../path-container/inspect-path-container.js';
import type { readContainerField } from '../path-container/read-container-field.js';

type ResolvedSetChild =
    | { readonly ok: true; readonly value: PathContainer }
    | { readonly issue: WandIssue; readonly ok: false };

export function resolveSetChild(
    read: Exclude<ReturnType<typeof readContainerField>, { readonly status: 'failed' }>,
    nextSegment: PathSegment | undefined,
    path: FieldPath,
    prefixLength: number,
): ResolvedSetChild {
    if (read.status === 'missing' || read.value === undefined) {
        return {
            ok: true,
            value: typeof nextSegment === 'number' ? [] : createDataRecord(Object.prototype),
        };
    }
    return inspectPathContainer(read.value, path, prefixLength);
}
