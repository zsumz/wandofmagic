import type { WandChange } from '../core/change.js';
import type { DataRecord } from '../core/data-record.js';
import type { ChangeCollector } from '../core/executable-step.js';
import { createIssue, type WandIssue } from '../core/issue.js';
import { fieldPath } from '../core/path.js';
import { createDataRecord } from '../internal/type-boundary.js';
import type { ProjectionProgram } from './projection-program.js';
import { defineSnapshotField } from './snapshot-field.js';

export type ProjectedSnapshotResult =
    | {
        readonly deferredOmitMask: number;
        readonly ok: true;
        readonly value: DataRecord;
    }
    | { readonly issue: WandIssue; readonly ok: false };

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
            return {
                ok: false,
                issue: createIssue({
                    code: 'unsupported_accessor',
                    message: `Wandofmagic will not execute the accessor at ${key}.`,
                    path: fieldPath(key),
                }),
            };
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
            entry !== undefined &&
            (sourceMask & 1 << index) !== 0 &&
            (destinationMask & 1 << index) !== 0
        ) {
            return {
                ok: false,
                issue: entry.conflictIssue,
            };
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

export function appendProjectedOmitChanges(
    changes: WandChange[] | undefined,
    program: ProjectionProgram,
    omitMask: number,
): void {
    if (changes === undefined) {
        return;
    }
    for (let index = 0; index < program.omit.fields.length; index += 1) {
        const field = program.omit.fields[index];
        if (field !== undefined && (omitMask & 1 << index) !== 0) {
            changes.push(field.change);
        }
    }
}
