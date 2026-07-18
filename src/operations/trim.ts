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
import { createIssue } from '../core/issue.js';
import { fieldPath } from '../core/path.js';
import { hasOwn } from '../runtime/data-record.js';
import { assertSafeKey } from '../runtime/safe-key.js';

export function createTrimStep(keys: readonly string[], id: string): ExecutableStep {
    if (keys.length === 0) {
        throw new PlanError('empty_operation', 'trim() requires at least one field.');
    }

    for (const key of keys) {
        assertSafeKey(key);
    }

    const uniqueKeys = Object.freeze([...new Set(keys)]);
    const fields = Object.freeze(uniqueKeys.map((key) => {
        const path = fieldPath(key);
        return Object.freeze({
            change: freezeChange({ kind: 'trim', path, stepId: id }),
            key,
            path,
        });
    }));
    const description: StepDescription = {
        id,
        kind: 'trim',
        reads: fields.map((field) => field.path),
        removes: [],
        writes: fields.map((field) => field.path),
    };
    const instruction = Object.freeze({ id, keys: uniqueKeys, kind: 'trim' as const });
    return Object.freeze({
        compile(next: PlanExecutor | undefined): PlanExecutor {
            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                const currentValues: unknown[] = new Array(fields.length);
                for (let index = 0; index < fields.length; index += 1) {
                    const field = fields[index];
                    if (field === undefined) {
                        continue;
                    }
                    if (!hasOwn(value, field.key)) {
                        continue;
                    }

                    const current = value[field.key];
                    currentValues[index] = current;
                    if (current === null || current === undefined) {
                        continue;
                    }

                    if (typeof current !== 'string') {
                        return createIssue({
                            code: 'unexpected_type',
                            message: `Cannot trim ${field.key}; expected a string, null, or undefined.`,
                            path: field.path,
                            step: { id, kind: 'trim' },
                        });
                    }
                }

                for (let index = 0; index < fields.length; index += 1) {
                    const field = fields[index];
                    const current = currentValues[index];
                    if (field === undefined) {
                        continue;
                    }
                    if (typeof current === 'string') {
                        const trimmed = current.trim();
                        if (trimmed !== current) {
                            value[field.key] = trimmed;
                            changes?.push(field.change);
                        }
                    }
                }
                return next?.(value, changes);
            };
        },
        id,
        instruction,
        kind: 'trim' as const,
        describe(): StepDescription {
            return description;
        },
    });
}
