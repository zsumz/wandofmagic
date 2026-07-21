import type { ChangeCollector } from '../../core/plan/executable-step.js';
import { createIssue } from '../../core/issue/create-issue.js';
import { createDataRecord } from '../../internal/type-boundary/record.js';
import { projectRecord } from '../project-record/project-record.js';
import type { ProjectionProgram } from '../projection-program/program-types.js';
import { defineSnapshotField } from './define-snapshot-field.js';
import type { SnapshotResult } from './snapshot-result.js';
import { snapshotAccessorIssue } from './snapshot-issues.js';

/** Snapshot a record while enforcing the safe own-data-property input contract. */
export function snapshotCheckedRecord(
    input: object,
    prototype: object | null,
    projection?: ProjectionProgram,
    changes?: ChangeCollector,
): SnapshotResult {
    for (const symbol of Object.getOwnPropertySymbols(input)) {
        if (Object.getOwnPropertyDescriptor(input, symbol)?.enumerable === true) {
            return {
                ok: false,
                issue: createIssue({
                    code: 'invalid_input',
                    message: 'Enumerable symbol keys are outside Wandofmagic\'s JSON-like data model.',
                }),
            };
        }
    }

    if (projection !== undefined) {
        return projectRecord(input, prototype, projection, changes);
    }

    const snapshot = createDataRecord(prototype);
    for (const key of Object.keys(input)) {
        const descriptor = Object.getOwnPropertyDescriptor(input, key);
        if (descriptor === undefined) {
            continue;
        }
        if (!('value' in descriptor)) {
            return { issue: snapshotAccessorIssue(key), ok: false };
        }
        defineSnapshotField(snapshot, key, descriptor.value);
    }

    return { ok: true, value: snapshot };
}
