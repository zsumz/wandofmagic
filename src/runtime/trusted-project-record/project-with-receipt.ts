import type { WandChange } from '../../core/change/receipt-types.js';
import type { DataRecord } from '../../core/execution/data-record.js';
import { createDataRecord } from '../../internal/type-boundary/record.js';
import type { ProjectionProgram } from '../projection-program/program-types.js';
import type { ProjectedSnapshotResult } from '../project-record/projected-snapshot-result.js';
import { defineSnapshotField } from '../data-record/define-snapshot-field.js';
import { findProjectionConflict } from './find-projection-conflict.js';

export function projectTrustedWithReceipt(
    input: DataRecord,
    prototype: object | null,
    program: ProjectionProgram,
    changes: WandChange[],
): ProjectedSnapshotResult {
    const snapshot = createDataRecord(prototype);
    const sourceValues: unknown[] = new Array(program.renameEntries.length);
    let destinationMask = 0;
    let omitMask = 0;
    let sourceMask = 0;

    for (const key in input) {
        const fieldValue = input[key];
        const action = program.actions.get(key);
        if (action?.sourceIndex !== undefined) {
            sourceMask |= 1 << action.sourceIndex;
            sourceValues[action.sourceIndex] = fieldValue;
            continue;
        }
        if (action?.destinationIndex !== undefined) {
            destinationMask |= 1 << action.destinationIndex;
        }
        if (action?.omitIndex !== undefined) {
            omitMask |= 1 << action.omitIndex;
            continue;
        }
        if (key === '__proto__') {
            defineSnapshotField(snapshot, key, fieldValue);
        } else {
            snapshot[key] = fieldValue;
        }
    }

    const conflict = findProjectionConflict(program, sourceMask, destinationMask);
    if (conflict !== undefined) {
        return conflict;
    }

    for (let index = 0; index < program.renameEntries.length; index += 1) {
        const entry = program.renameEntries[index];
        if (entry === undefined || (sourceMask & 1 << index) === 0) {
            continue;
        }
        const omitIndex = entry.destinationOmitIndex;
        if (omitIndex === undefined) {
            snapshot[entry.destination] = sourceValues[index];
        } else {
            omitMask |= 1 << omitIndex;
        }
        changes.push(entry.change);
    }
    return { deferredOmitMask: omitMask, ok: true, value: snapshot };
}
