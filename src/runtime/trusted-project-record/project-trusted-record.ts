import type { ChangeCollector } from '../../core/plan/executable-step.js';
import { castInputRecord } from '../../internal/type-boundary/record.js';
import type { ProjectedSnapshotResult } from '../project-record/projected-snapshot-result.js';
import type { ProjectionProgram } from '../projection-program/program-types.js';
import { projectTrustedWithReceipt } from './project-with-receipt.js';
import { projectTrustedWithoutReceipt } from './project-without-receipt.js';

/** Project a caller-trusted own-data record without allocating a key list or inspecting descriptors. */
export function projectTrustedRecord(
    input: object,
    prototype: object | null,
    program: ProjectionProgram,
    changes: ChangeCollector,
): ProjectedSnapshotResult {
    const record = castInputRecord(input);
    return changes === undefined
        ? projectTrustedWithoutReceipt(record, prototype, program)
        : projectTrustedWithReceipt(record, prototype, program, changes);
}
