import type { DataRecord } from '../core/data-record.js';
import { freezeChange } from '../core/change.js';
import type { StepDescription } from '../core/description.js';
import { PlanError } from '../core/errors.js';
import type {
    ChangeCollector,
    ExecutableStep,
    PlanExecutor,
    StepOutcome,
} from '../core/executable-step.js';
import { fieldPath } from '../core/path.js';
import { deleteField, hasOwn } from '../runtime/data-record.js';
import { assertSafeKey } from '../runtime/safe-key.js';

export function createOmitStep(keys: readonly string[], id: string): ExecutableStep {
    if (keys.length === 0) {
        throw new PlanError('empty_operation', 'omit() requires at least one field.');
    }

    for (const key of keys) {
        assertSafeKey(key);
    }

    const uniqueKeys = Object.freeze([...new Set(keys)]);
    const fields = Object.freeze(uniqueKeys.map((key) => {
        const path = fieldPath(key);
        return Object.freeze({
            change: freezeChange({ kind: 'omit', path, stepId: id }),
            key,
            path,
        });
    }));
    const description: StepDescription = {
        id,
        kind: 'omit',
        reads: fields.map((field) => field.path),
        removes: fields.map((field) => field.path),
        writes: [],
    };
    const projection = Object.freeze({ fields, kind: 'omit' as const });
    const instruction = Object.freeze({ id, keys: uniqueKeys, kind: 'omit' as const });

    return Object.freeze({
        compile(next: PlanExecutor | undefined): PlanExecutor {
            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                for (const field of fields) {
                    if (hasOwn(value, field.key)) {
                        deleteField(value, field.key);
                        changes?.push(field.change);
                    }
                }
                return next?.(value, changes);
            };
        },
        id,
        instruction,
        kind: 'omit' as const,
        projection,
        describe(): StepDescription {
            return description;
        },
    });
}
