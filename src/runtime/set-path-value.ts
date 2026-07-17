import type { DataRecord } from '../core/data-record.js';
import type { WandIssue } from '../core/issue.js';
import type { FieldPath, PathSegment } from '../core/path.js';
import {
    castInputRecord,
    createDataRecord,
    isUnknownArray,
} from '../internal/type-boundary.js';
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

export type PathSetResult =
    | { readonly changed: boolean; readonly ok: true; readonly value: DataRecord }
    | { readonly issue: WandIssue; readonly ok: false };

type ContainerSetResult =
    | { readonly changed: boolean; readonly ok: true; readonly value: PathContainer }
    | { readonly issue: WandIssue; readonly ok: false };

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

function setContainer(
    container: PathContainer,
    path: FieldPath,
    index: number,
    replacement: unknown,
    visited: ReadonlySet<object>,
): ContainerSetResult {
    const segment = path[index];
    if (segment === undefined) {
        return invalidPathFailure(path);
    }
    const read = readContainerField(container, segment, path, index + 1);
    if (read.status === 'failed') {
        return { issue: read.issue, ok: false };
    }
    if (index === path.length - 1) {
        if (
            typeof replacement === 'object'
            && replacement !== null
            && visited.has(replacement)
        ) {
            return { issue: pathCycleIssue(path, index + 1, 'write'), ok: false };
        }
        if (read.status === 'found' && Object.is(read.value, replacement)) {
            return { changed: false, ok: true, value: container };
        }
        return cloneAndSet(container, path, index, segment, replacement);
    }

    const childResult = resolveChild(read, path[index + 1], path, index + 1);
    if (!childResult.ok) {
        return childResult;
    }
    if (visited.has(childResult.value)) {
        return { issue: pathCycleIssue(path, index + 1, 'write'), ok: false };
    }
    const nextVisited = new Set(visited);
    nextVisited.add(childResult.value);
    const childMutation = setContainer(
        childResult.value,
        path,
        index + 1,
        replacement,
        nextVisited,
    );
    if (!childMutation.ok || !childMutation.changed) {
        return childMutation.ok
            ? { changed: false, ok: true, value: container }
            : childMutation;
    }
    return cloneAndSet(container, path, index, segment, childMutation.value);
}

function resolveChild(
    read: Exclude<ReturnType<typeof readContainerField>, { readonly status: 'failed' }>,
    nextSegment: PathSegment | undefined,
    path: FieldPath,
    prefixLength: number,
): { readonly ok: true; readonly value: PathContainer } | { readonly issue: WandIssue; readonly ok: false } {
    if (read.status === 'missing' || read.value === undefined) {
        return {
            ok: true,
            value: typeof nextSegment === 'number' ? [] : createDataRecord(Object.prototype),
        };
    }
    return inspectPathContainer(read.value, path, prefixLength);
}

function cloneAndSet(
    container: PathContainer,
    path: FieldPath,
    index: number,
    segment: PathSegment,
    value: unknown,
): ContainerSetResult {
    const cloned = clonePathContainer(container, path, index);
    if (!cloned.ok) {
        return cloned;
    }
    defineContainerField(cloned.value, segment, value);
    return { changed: true, ok: true, value: cloned.value };
}

function invalidPathFailure(path: FieldPath): ContainerSetResult {
    return { issue: invalidNormalizedPathIssue(path), ok: false };
}
