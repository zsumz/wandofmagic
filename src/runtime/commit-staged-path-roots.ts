import type { DataRecord } from '../core/data-record.js';
import type { FieldPath } from '../core/path.js';
import { defineContainerField } from './clone-path-container.js';
import { deleteField, hasOwn } from './data-record.js';

/** Commit final copy-on-write branches after a multi-path operation has fully succeeded. */
export function commitStagedPathRoots(
    root: DataRecord,
    staged: DataRecord,
    paths: readonly FieldPath[],
): void {
    const roots = new Set(paths.map((path) => path[0]));
    for (const rootKey of roots) {
        if (hasOwn(staged, rootKey)) {
            defineContainerField(root, rootKey, staged[rootKey]);
        } else {
            deleteField(root, rootKey);
        }
    }
}
