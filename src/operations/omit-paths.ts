import { freezeChange, type WandChange } from '../core/change.js';
import type { DataRecord } from '../core/data-record.js';
import type { StepDescription } from '../core/description.js';
import { PlanError } from '../core/errors.js';
import type {
    ChangeCollector,
    ExecutableStep,
    PlanExecutor,
    StepOutcome,
} from '../core/executable-step.js';
import { attachIssueStep } from '../core/issue.js';
import type { FieldPath, PathInput } from '../core/path.js';
import { commitStagedPathRoots } from '../runtime/commit-staged-path-roots.js';
import { deletePathValue } from '../runtime/delete-path-value.js';
import { normalizePath } from '../runtime/normalize-path.js';
import { isPathPrefix } from '../runtime/path-prefix.js';

interface OmitPathField {
    readonly change: WandChange;
    readonly path: FieldPath;
}

export function createOmitPathsStep(
    pathInputs: readonly PathInput[],
    id: string,
): ExecutableStep {
    const fields = canonicalFields(pathInputs, id);
    const paths = Object.freeze(fields.map((field) => field.path));
    const description: StepDescription = {
        id,
        kind: 'omit',
        reads: paths,
        removes: paths,
        writes: [],
    };
    const instruction = Object.freeze({ id, kind: 'omit-paths' as const, paths });

    return Object.freeze({
        compile(next: PlanExecutor | undefined): PlanExecutor {
            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                let staged = value;
                const changedFields: OmitPathField[] = [];
                for (const field of fields) {
                    const deleted = deletePathValue(staged, field.path);
                    if (!deleted.ok) {
                        return attachIssueStep(deleted.issue, { id, kind: 'omit' });
                    }
                    if (deleted.changed) {
                        staged = deleted.value;
                        changedFields.push(field);
                    }
                }
                if (changedFields.length === 0) {
                    return next?.(value, changes);
                }

                commitStagedPathRoots(
                    value,
                    staged,
                    changedFields.map((field) => field.path),
                );
                if (changes !== undefined) {
                    for (const field of changedFields) {
                        changes.push(field.change);
                    }
                }
                return next?.(value, changes);
            };
        },
        id,
        instruction,
        kind: 'omit' as const,
        describe(): StepDescription {
            return description;
        },
    });
}

function canonicalFields(pathInputs: readonly PathInput[], id: string): readonly OmitPathField[] {
    if (pathInputs.length === 0) {
        throw new PlanError('empty_operation', 'omit() requires at least one path.');
    }
    const unique: FieldPath[] = [];
    for (const input of pathInputs) {
        const path = normalizePath(input);
        if (!unique.some((candidate) => samePath(candidate, path))) {
            unique.push(path);
        }
    }
    const retained = unique.filter((candidate) => !unique.some((other) =>
        other !== candidate && other.length < candidate.length && isPathPrefix(other, candidate)));
    return Object.freeze(retained.map((path) => Object.freeze({
        change: freezeChange({ kind: 'omit', path, stepId: id }),
        path,
    })));
}

function samePath(left: FieldPath, right: FieldPath): boolean {
    return left.length === right.length && isPathPrefix(left, right);
}
