import type { DataRecord } from '../core/data-record.js';
import type { ChangeCollector } from '../core/executable-step.js';
import type { InputPolicy } from '../core/options.js';
import { createIssue } from '../core/issue.js';
import { fieldPath } from '../core/path.js';
import { createDataRecord, getObjectPrototype } from '../internal/type-boundary.js';
import { projectRecord } from './project-record.js';
import type { ProjectionProgram } from './projection-program.js';
import { defineSnapshotField } from './snapshot-field.js';
import type { SnapshotResult } from './snapshot-result.js';
import { snapshotTrustedRecord } from './trusted-data-record.js';

const objectPrototype = Object.prototype;

export function hasOwn(record: DataRecord, key: string): boolean {
    return objectPrototype.hasOwnProperty.call(record, key);
}

export function deleteField(record: DataRecord, key: string): void {
    // The key was plan-validated and the record is a private writable snapshot.
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete record[key];
}

export function snapshotRecord(
    input: object,
    projection?: ProjectionProgram,
    changes?: ChangeCollector,
    inputPolicy: InputPolicy = 'checked',
): SnapshotResult {
    const prototype = getObjectPrototype(input);
    if (prototype !== objectPrototype && prototype !== null) {
        return {
            ok: false,
            issue: createIssue({
                code: 'invalid_input',
                message: Array.isArray(input)
                    ? 'The v0 execution core accepts a plain object at the root, not an array.'
                    : 'Wandofmagic accepts plain objects and null-prototype objects at the root.',
            }),
        };
    }

    if (inputPolicy === 'trusted') {
        return snapshotTrustedRecord(input, prototype, projection, changes);
    }

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
            return {
                ok: false,
                issue: createIssue({
                    code: 'unsupported_accessor',
                    message: `Wandofmagic will not execute the accessor at ${key}.`,
                    path: fieldPath(key),
                }),
            };
        }

        defineSnapshotField(snapshot, key, descriptor.value);
    }

    return { ok: true, value: snapshot };
}

export function valueKind(value: unknown): string {
    if (value === null) {
        return 'null';
    }

    if (Array.isArray(value)) {
        return 'array';
    }

    if (value instanceof Date) {
        return 'date';
    }

    return typeof value;
}
