import type { WandIssue } from '../../core/issue/issue-types.js';
import type { FieldPath } from '../../core/path/path.js';
import { inspectPathContainer } from '../path-container/inspect-path-container.js';
import { readContainerField } from '../path-container/read-container-field.js';
import { invalidNormalizedPathIssue, pathCycleIssue } from './path-operation-issues.js';
import { pathPrefix } from './path-prefix.js';

export type PathReadResult =
    | { readonly issue: WandIssue; readonly status: 'failed' }
    | { readonly status: 'found'; readonly value: unknown }
    | { readonly status: 'missing' };

/** Read one normalized path through own enumerable data descriptors without invoking getters. */
export function readPath(root: object, path: FieldPath): PathReadResult {
    const inspectedRoot = inspectPathContainer(root, path, 0);
    if (!inspectedRoot.ok) {
        return { issue: inspectedRoot.issue, status: 'failed' };
    }
    let current = inspectedRoot.value;
    const visited: Set<object> = new Set([root]);

    for (let index = 0; index < path.length; index += 1) {
        const segment = path[index];
        if (segment === undefined) {
            return {
                issue: invalidNormalizedPathIssue(pathPrefix(path, index + 1)),
                status: 'failed',
            };
        }
        const read = readContainerField(current, segment, path, index + 1);
        if (read.status !== 'found') {
            return read;
        }
        const value = read.value;
        if (index === path.length - 1) {
            return { status: 'found', value };
        }
        if (value === undefined) {
            return { status: 'missing' };
        }
        const inspected = inspectPathContainer(value, path, index + 1);
        if (!inspected.ok) {
            return { issue: inspected.issue, status: 'failed' };
        }
        if (visited.has(inspected.value)) {
            return {
                issue: pathCycleIssue(path, index + 1, 'read'),
                status: 'failed',
            };
        }
        visited.add(inspected.value);
        current = inspected.value;
    }

    return { status: 'missing' };
}
