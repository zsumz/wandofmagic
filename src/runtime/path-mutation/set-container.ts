import type { FieldPath } from '../../core/path/path.js';
import type { PathContainer } from '../path-container/container-types.js';
import { readContainerField } from '../path-container/read-container-field.js';
import { invalidNormalizedPathIssue, pathCycleIssue } from '../path/path-operation-issues.js';
import { cloneAndSet } from './clone-and-set.js';
import type { ContainerMutationResult } from './mutation-result.js';
import { resolveSetChild } from './resolve-set-child.js';

export function setContainer(
    container: PathContainer,
    path: FieldPath,
    index: number,
    replacement: unknown,
    visited: ReadonlySet<object>,
): ContainerMutationResult {
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

    const childResult = resolveSetChild(read, path[index + 1], path, index + 1);
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

function invalidPathFailure(path: FieldPath): ContainerMutationResult {
    return { issue: invalidNormalizedPathIssue(path), ok: false };
}
