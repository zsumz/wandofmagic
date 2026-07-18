import type { WandChange } from '../core/change.js';
import type { DataRecord } from '../core/data-record.js';
import type { ChangeCollector } from '../core/executable-step.js';
import { castInputRecord, createDataRecord } from '../internal/type-boundary.js';
import type { ProjectionProgram } from './projection-program.js';
import type { ProjectedSnapshotResult } from './project-record.js';
import { defineSnapshotField } from './snapshot-field.js';

/** Project a caller-trusted own-data record without allocating a key list or inspecting descriptors. */
export function projectTrustedRecord(
    input: object,
    prototype: object | null,
    program: ProjectionProgram,
    changes: ChangeCollector,
): ProjectedSnapshotResult {
    const record = castInputRecord(input);
    if (changes === undefined) {
        return projectWithoutReceipt(record, prototype, program);
    }

    return projectWithReceipt(record, prototype, program, changes);
}

function projectWithoutReceipt(
    input: DataRecord,
    prototype: object | null,
    program: ProjectionProgram,
): ProjectedSnapshotResult {
    const snapshot = createDataRecord(prototype);
    const sourceValues: unknown[] = new Array(program.renameEntries.length);
    let destinationMask = 0;
    let sourceMask = 0;

    for (const key in input) {
        const fieldValue = input[key];
        const action = program.actions.get(key);
        if (action?.sourceIndex !== undefined) {
            const sourceIndex = action.sourceIndex;
            sourceMask |= 1 << sourceIndex;
            sourceValues[sourceIndex] = fieldValue;
            continue;
        }
        if (action?.destinationIndex !== undefined) {
            destinationMask |= 1 << action.destinationIndex;
        }
        if (action?.omitIndex !== undefined) {
            continue;
        }
        if (key === '__proto__') {
            defineSnapshotField(snapshot, key, fieldValue);
        } else {
            snapshot[key] = fieldValue;
        }
    }

    const conflict = findConflict(program, sourceMask, destinationMask);
    if (conflict !== undefined) {
        return conflict;
    }

    for (let index = 0; index < program.renameEntries.length; index += 1) {
        const entry = program.renameEntries[index];
        if (
            entry !== undefined
            && entry.destinationOmitIndex === undefined
            && (sourceMask & 1 << index) !== 0
        ) {
            snapshot[entry.destination] = sourceValues[index];
        }
    }

    return { deferredOmitMask: 0, ok: true, value: snapshot };
}

function projectWithReceipt(
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

    const conflict = findConflict(program, sourceMask, destinationMask);
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

function findConflict(
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
