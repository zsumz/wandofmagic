import type { ProjectionProgram } from '../projection-program/program-types.js';
import type { ProjectedSnapshotResult } from '../project-record/projected-snapshot-result.js';

export function findProjectionConflict(
    program: ProjectionProgram,
    sourceMask: number,
    destinationMask: number,
): ProjectedSnapshotResult | undefined {
    const conflictMask = sourceMask & destinationMask;
    if (conflictMask === 0) {
        return undefined;
    }

    for (let index = 0; index < program.renameEntries.length; index += 1) {
        const entry = program.renameEntries[index];
        if (entry !== undefined && (conflictMask & 1 << index) !== 0) {
            return { issue: entry.conflictIssue, ok: false };
        }
    }
    return undefined;
}
