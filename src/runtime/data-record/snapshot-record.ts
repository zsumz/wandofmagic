import type { ChangeCollector } from '../../core/plan/executable-step.js';
import { createIssue } from '../../core/issue/create-issue.js';
import type { InputPolicy } from '../../core/execution/run-options.js';
import { getObjectPrototype } from '../../internal/type-boundary/record.js';
import type { ProjectionProgram } from '../projection-program/program-types.js';
import type { SnapshotResult } from './snapshot-result.js';
import { snapshotCheckedRecord } from './snapshot-checked-record.js';
import { snapshotTrustedRecord } from './snapshot-trusted-record.js';

const objectPrototype = Object.prototype;

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

    return inputPolicy === 'trusted'
        ? snapshotTrustedRecord(input, prototype, projection, changes)
        : snapshotCheckedRecord(input, prototype, projection, changes);
}
