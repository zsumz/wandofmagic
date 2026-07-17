import type { DataRecord } from '../core/data-record.js';
import type { WandIssue } from '../core/issue.js';
import type { FieldPath } from '../core/path.js';
import { castInputRecord, isUnknownArray } from '../internal/type-boundary.js';
import {
    clonePathContainer,
    defineContainerField,
} from './clone-path-container.js';
import {
    inspectPathContainer,
    type PathContainer,
    readContainerField,
} from './path-container.js';
import {
    invalidNormalizedPathIssue,
    pathCycleIssue,
    rootArrayMutationIssue,
} from './path-mutation-issue.js';

export type PathDeleteResult =
    | { readonly changed: boolean; readonly ok: true; readonly value: DataRecord }
    | { readonly issue: WandIssue; readonly ok: false };

type ContainerDeleteResult =
    | { readonly changed: boolean; readonly ok: true; readonly value: PathContainer }
    | { readonly issue: WandIssue; readonly ok: false };

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

function deleteFromContainer(
    container: PathContainer,
    path: FieldPath,
    index: number,
    visited: ReadonlySet<object>,
): ContainerDeleteResult {
    const segment = path[index];
    if (segment === undefined) {
        return invalidPathFailure(path);
    }
    const read = readContainerField(container, segment, path, index + 1);
    if (read.status === 'failed') {
        return { issue: read.issue, ok: false };
    }
    if (read.status === 'missing') {
        return { changed: false, ok: true, value: container };
    }
    if (index === path.length - 1) {
        const cloned = clonePathContainer(container, path, index);
        if (!cloned.ok) {
            return cloned;
        }
        Reflect.deleteProperty(cloned.value, segment);
        return { changed: true, ok: true, value: cloned.value };
    }
    if (read.value === undefined || read.value === null) {
        return { changed: false, ok: true, value: container };
    }
    const child = inspectPathContainer(read.value, path, index + 1);
    if (!child.ok) {
        return child;
    }
    if (visited.has(child.value)) {
        return { issue: pathCycleIssue(path, index + 1, 'delete'), ok: false };
    }
    const nextVisited = new Set(visited);
    nextVisited.add(child.value);
    const childMutation = deleteFromContainer(child.value, path, index + 1, nextVisited);
    if (!childMutation.ok || !childMutation.changed) {
        return childMutation.ok
            ? { changed: false, ok: true, value: container }
            : childMutation;
    }
    const cloned = clonePathContainer(container, path, index);
    if (!cloned.ok) {
        return cloned;
    }
    defineContainerField(cloned.value, segment, childMutation.value);
    return { changed: true, ok: true, value: cloned.value };
}

function invalidPathFailure(path: FieldPath): ContainerDeleteResult {
    return { issue: invalidNormalizedPathIssue(path), ok: false };
}
