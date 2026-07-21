import type { ChangeCollector } from '../../core/plan/executable-step.js';
import { createDataRecord } from '../../internal/type-boundary/record.js';
import { defineSnapshotField } from '../data-record/define-snapshot-field.js';
import { snapshotAccessorIssue } from '../data-record/snapshot-issues.js';
import type { ProjectionProgram } from '../projection-program/program-types.js';
import type { ProjectedSnapshotResult } from './projected-snapshot-result.js';

export function projectRecord(
    input: object,
    prototype: object | null,
    program: ProjectionProgram,
    changes: ChangeCollector,
): ProjectedSnapshotResult {
    const snapshot = createDataRecord(prototype);
    const sourceValues: unknown[] = new Array(program.renameEntries.length);
    let destinationMask = 0;
    let omitMask = 0;
    let sourceMask = 0;

    for (const key of Object.keys(input)) {
        const descriptor = Object.getOwnPropertyDescriptor(input, key);
        if (descriptor === undefined) {
            continue;
        }
        if (!('value' in descriptor)) {
            return { issue: snapshotAccessorIssue(key), ok: false };
        }

        const action = program.actions.get(key);
        if (action?.sourceIndex !== undefined) {
            sourceMask |= 1 << action.sourceIndex;
            sourceValues[action.sourceIndex] = descriptor.value;
            continue;
        }
        if (action?.destinationIndex !== undefined) {
            destinationMask |= 1 << action.destinationIndex;
        }
        if (action?.omitIndex !== undefined) {
            omitMask |= 1 << action.omitIndex;
            continue;
        }
        defineSnapshotField(snapshot, key, descriptor.value);
    }

    for (let index = 0; index < program.renameEntries.length; index += 1) {
        const entry = program.renameEntries[index];
        if (
            entry !== undefined
            && (sourceMask & 1 << index) !== 0
            && (destinationMask & 1 << index) !== 0
        ) {
            return { ok: false, issue: entry.conflictIssue };
        }
    }

    for (let index = 0; index < program.renameEntries.length; index += 1) {
        const entry = program.renameEntries[index];
        if (entry === undefined || (sourceMask & 1 << index) === 0) {
            continue;
        }
        const omitIndex = entry.destinationOmitIndex;
        if (omitIndex === undefined) {
            defineSnapshotField(snapshot, entry.destination, sourceValues[index]);
        } else {
            omitMask |= 1 << omitIndex;
        }
        changes?.push(entry.change);
    }

    return { deferredOmitMask: omitMask, ok: true, value: snapshot };
}
