import type { ChangeCollector } from '../../core/plan/executable-step.js';
import {
    castInputRecord,
    createDataRecord,
} from '../../internal/type-boundary/record.js';
import type { ProjectionProgram } from '../projection-program/program-types.js';
import { defineSnapshotField } from './define-snapshot-field.js';
import type { SnapshotResult } from './snapshot-result.js';
import { projectTrustedRecord } from '../trusted-project-record/project-trusted-record.js';

/** Snapshot a caller-trusted record whose enumerable properties are guaranteed to be own data. */
export function snapshotTrustedRecord(
    input: object,
    prototype: object | null,
    projection?: ProjectionProgram,
    changes?: ChangeCollector,
): SnapshotResult {
    if (projection !== undefined) {
        return projectTrustedRecord(input, prototype, projection, changes);
    }

    const record = castInputRecord(input);
    const snapshot = createDataRecord(prototype);
    for (const key in record) {
        const value = record[key];
        if (key === '__proto__') {
            defineSnapshotField(snapshot, key, value);
        } else {
            snapshot[key] = value;
        }
    }

    return { ok: true, value: snapshot };
}
