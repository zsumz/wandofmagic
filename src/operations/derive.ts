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
import { type ErasedDerive, invokeDerive } from '../internal/type-boundary.js';
import { hasOwn } from '../runtime/data-record.js';
import { isPromiseLike } from '../runtime/promise-like.js';
import { assertSafeKey } from '../runtime/safe-key.js';

export function createDeriveStep(
    key: string,
    dependencies: readonly string[],
    derive: ErasedDerive,
    id: string,
): ExecutableStep {
    assertSafeKey(key);
    if (dependencies.length === 0) {
        throw new PlanError('empty_operation', 'derive() requires at least one dependency.');
    }

    for (const dependency of dependencies) {
        assertSafeKey(dependency);
    }

    const uniqueDependencies = Object.freeze([...new Set(dependencies)]);
    if (uniqueDependencies.length !== dependencies.length) {
        throw new PlanError('duplicate_dependency', 'derive() dependencies must be unique.');
    }

    const path = fieldPath(key);
    const dependencyFields = Object.freeze(dependencies.map((dependency) => Object.freeze({
        dependency,
        path: fieldPath(dependency),
    })));
    const sourcePaths = dependencyFields.map((field) => field.path);
    const change = freezeChange({ kind: 'derive', path, sources: sourcePaths, stepId: id });
    const description: StepDescription = {
        id,
        kind: 'derive',
        reads: sourcePaths,
        removes: [],
        writes: [path],
    };
    const instruction = Object.freeze({
        binding: derive,
        dependencies: uniqueDependencies,
        id,
        key,
        kind: 'derive' as const,
    });

    return Object.freeze({
        compile(next: PlanExecutor | undefined): PlanExecutor {
            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                if (hasOwn(value, key)) {
                    return createIssue({
                        code: 'destination_conflict',
                        message: `Cannot derive ${key}; the destination already exists.`,
                        path,
                        step: { id, kind: 'derive' },
                    });
                }

                const inputs: unknown[] = new Array(dependencyFields.length);
                for (let index = 0; index < dependencyFields.length; index += 1) {
                    const field = dependencyFields[index];
                    if (field === undefined) {
                        continue;
                    }
                    let dependencyValue: unknown;
                    if (hasOwn(value, field.dependency)) {
                        dependencyValue = value[field.dependency];
                    }
                    if (dependencyValue === undefined) {
                        return createIssue({
                            code: 'missing_field',
                            message: `Cannot derive ${key}; ${field.dependency} is missing or undefined.`,
                            path: field.path,
                            step: { id, kind: 'derive' },
                        });
                    }
                    inputs[index] = dependencyValue;
                }

                let derived: unknown;
                try {
                    derived = invokeDerive(derive, inputs);
                    if (isPromiseLike(derived)) {
                        return createIssue({
                            code: 'transform_failed',
                            message: `The derive callback for ${key} returned a promise in the synchronous core.`,
                            path,
                            step: { id, kind: 'derive' },
                        });
                    }
                } catch (cause) {
                    return createIssue({
                        cause,
                        code: 'transform_failed',
                        message: `The derive callback for ${key} threw an error.`,
                        path,
                        step: { id, kind: 'derive' },
                    });
                }

                value[key] = derived;
                changes?.push(change);
                return next?.(value, changes);
            };
        },
        id,
        instruction,
        kind: 'derive' as const,
        describe(): StepDescription {
            return description;
        },
    });
}
