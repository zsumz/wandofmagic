import type { DataRecord } from '../core/data-record.js';
import { freezeChange } from '../core/change.js';
import type { StepDescription } from '../core/description.js';
import type {
    ChangeCollector,
    ExecutableStep,
    PlanExecutor,
    StepOutcome,
} from '../core/executable-step.js';
import { createIssue } from '../core/issue.js';
import type { MissingPolicy } from '../core/options.js';
import { fieldPath } from '../core/path.js';
import { type ErasedTransform, invokeTransform } from '../internal/type-boundary.js';
import { hasOwn } from '../runtime/data-record.js';
import { isPromiseLike } from '../runtime/promise-like.js';
import { assertSafeKey } from '../runtime/safe-key.js';

export function createTransformStep(
    key: string,
    transform: ErasedTransform,
    missing: MissingPolicy,
    id: string,
): ExecutableStep {
    assertSafeKey(key);
    const path = fieldPath(key);
    const change = freezeChange({ kind: 'transform', path, stepId: id });
    const description: StepDescription = {
        id,
        kind: 'transform',
        reads: [path],
        removes: [],
        writes: [path],
    };
    const instruction = Object.freeze({
        binding: transform,
        id,
        key,
        kind: 'transform' as const,
        missing,
    });

    return Object.freeze({
        compile(next: PlanExecutor | undefined): PlanExecutor {
            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                let current: unknown;
                if (hasOwn(value, key)) {
                    current = value[key];
                }
                if (current === undefined) {
                    if (missing === 'skip') {
                        return next?.(value, changes);
                    }

                    return createIssue({
                        code: 'missing_field',
                        message: `Cannot transform ${key}; the field is missing or undefined.`,
                        path,
                        step: { id, kind: 'transform' },
                    });
                }

                let transformed: unknown;
                try {
                    transformed = invokeTransform(transform, current);
                    if (isPromiseLike(transformed)) {
                        return createIssue({
                            code: 'transform_failed',
                            message: `The transform for ${key} returned a promise in the synchronous core.`,
                            path,
                            step: { id, kind: 'transform' },
                        });
                    }
                } catch (cause) {
                    return createIssue({
                        cause,
                        code: 'transform_failed',
                        message: `The transform for ${key} threw an error.`,
                        path,
                        step: { id, kind: 'transform' },
                    });
                }

                if (Object.is(current, transformed)) {
                    return next?.(value, changes);
                }

                value[key] = transformed;
                changes?.push(change);
                return next?.(value, changes);
            };
        },
        id,
        instruction,
        kind: 'transform' as const,
        describe(): StepDescription {
            return description;
        },
    });
}
