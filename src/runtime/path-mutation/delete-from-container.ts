import type { FieldPath } from '../../core/path/path.js';
import { clonePathContainer } from '../clone-path-container/clone-path-container.js';
import { defineContainerField } from '../clone-path-container/define-container-field.js';
import type { PathContainer } from '../path-container/container-types.js';
import { inspectPathContainer } from '../path-container/inspect-path-container.js';
import { readContainerField } from '../path-container/read-container-field.js';
import { invalidNormalizedPathIssue, pathCycleIssue } from '../path/path-operation-issues.js';
import type { ContainerMutationResult } from './mutation-result.js';

export function deleteFromContainer(
    container: PathContainer,
    path: FieldPath,
    index: number,
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

function invalidPathFailure(path: FieldPath): ContainerMutationResult {
    return { issue: invalidNormalizedPathIssue(path), ok: false };
}
