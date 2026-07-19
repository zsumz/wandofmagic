import { freezeChange } from '../core/change.js';
import type { DataRecord } from '../core/data-record.js';
import type { StepDescription } from '../core/description.js';
import type {
    ChangeCollector,
    ExecutableStep,
    PlanExecutor,
    StepOutcome,
} from '../core/executable-step.js';
import { attachIssueStep, createIssue } from '../core/issue.js';
import type { MissingPolicy } from '../core/options.js';
import type { FieldPath, Path } from '../core/path.js';
import { type ErasedTransform, invokeTransform } from '../internal/type-boundary.js';
import { commitSetPathValue } from '../runtime/commit-set-path-value.js';
import { isPromiseLike } from '../runtime/promise-like.js';
import { normalizePath } from '../runtime/normalize-path.js';
import { readPath } from '../runtime/read-path.js';

export function createTransformPathStep(
    pathInput: Path,
    transform: ErasedTransform,
    missing: MissingPolicy,
    id: string,
): ExecutableStep {
    const path = normalizePath(pathInput);
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
        kind: 'transform-path' as const,
        missing,
        path,
    });

    return Object.freeze({
        compile(next: PlanExecutor | undefined): PlanExecutor {
            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                const read = readPath(value, path);
                if (read.status === 'failed') {
                    return attachIssueStep(read.issue, { id, kind: 'transform' });
                }
                if (read.status === 'missing' || read.value === undefined) {
                    return missing === 'skip'
                        ? next?.(value, changes)
                        : missingIssue(path, id);
                }
                const transformed = runTransform(transform, read.value, path, id);
                if (!transformed.ok) {
                    return transformed.issue;
                }
                if (Object.is(read.value, transformed.value)) {
                    return next?.(value, changes);
                }
                const write = commitSetPathValue(value, path, transformed.value);
                if (!write.ok) {
                    return attachIssueStep(write.issue, { id, kind: 'transform' });
                }
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

function runTransform(
    transform: ErasedTransform,
    current: unknown,
    path: FieldPath,
    id: string,
): { readonly issue: ReturnType<typeof createIssue>; readonly ok: false }
    | { readonly ok: true; readonly value: unknown } {
    try {
        const value = invokeTransform(transform, current);
        return isPromiseLike(value)
            ? { issue: transformIssue(path, id, 'returned a promise'), ok: false }
            : { ok: true, value };
    } catch (cause) {
        return { issue: transformIssue(path, id, 'threw an error', cause), ok: false };
    }
}

function missingIssue(path: FieldPath, id: string): ReturnType<typeof createIssue> {
    return createIssue({
        code: 'missing_field',
        message: 'Cannot transform the selected path; it is missing or undefined.',
        path,
        step: { id, kind: 'transform' },
    });
}

function transformIssue(
    path: FieldPath,
    id: string,
    outcome: 'returned a promise' | 'threw an error',
    cause?: unknown,
): ReturnType<typeof createIssue> {
    return createIssue({
        ...cause === undefined ? {} : { cause },
        code: 'transform_failed',
        message: `The transform for the selected path ${outcome}.`,
        path,
        step: { id, kind: 'transform' },
    });
}
