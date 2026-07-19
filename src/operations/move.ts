import { freezeChange } from '../core/change.js';
import type { DataRecord } from '../core/data-record.js';
import type { StepDescription } from '../core/description.js';
import { PlanError } from '../core/errors.js';
import type {
    ChangeCollector,
    ExecutableStep,
    PlanExecutor,
    StepOutcome,
} from '../core/executable-step.js';
import { attachIssueStep, createIssue } from '../core/issue.js';
import type { MissingPolicy, MoveConflictPolicy } from '../core/options.js';
import type { FieldPath, PathInput } from '../core/path.js';
import { commitStagedPathRoots } from '../runtime/commit-staged-path-roots.js';
import { deletePathValue } from '../runtime/delete-path-value.js';
import { normalizePath } from '../runtime/normalize-path.js';
import { isPathPrefix } from '../runtime/path-prefix.js';
import { readPath } from '../runtime/read-path.js';
import { setPathValue } from '../runtime/set-path-value.js';

export function createMoveStep(
    sourceInput: PathInput,
    destinationInput: PathInput,
    missing: MissingPolicy,
    conflict: MoveConflictPolicy,
    id: string,
): ExecutableStep {
    const source = normalizePath(sourceInput);
    const destination = normalizePath(destinationInput);
    assertDisjoint(source, destination);
    const change = freezeChange({ from: source, kind: 'move', stepId: id, to: destination });
    const description: StepDescription = {
        id,
        kind: 'move',
        reads: [source, destination],
        removes: [source],
        writes: [destination],
    };
    const instruction = Object.freeze({ conflict, destination, id, kind: 'move' as const, missing, source });

    return Object.freeze({
        compile(next: PlanExecutor | undefined): PlanExecutor {
            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                const sourceRead = readPath(value, source);
                if (sourceRead.status === 'failed') {
                    return attachIssueStep(sourceRead.issue, { id, kind: 'move' });
                }
                if (sourceRead.status === 'missing' || sourceRead.value === undefined) {
                    return missing === 'skip' ? next?.(value, changes) : missingIssue(source, id);
                }

                const destinationRead = readPath(value, destination);
                if (destinationRead.status === 'failed') {
                    return attachIssueStep(destinationRead.issue, { id, kind: 'move' });
                }
                if (destinationRead.status === 'found') {
                    if (conflict === 'preserve') {
                        return next?.(value, changes);
                    }
                    if (conflict === 'error') {
                        return conflictIssue(destination, id);
                    }
                }

                const written = setPathValue(value, destination, sourceRead.value);
                if (!written.ok) {
                    return attachIssueStep(written.issue, { id, kind: 'move' });
                }
                const deleted = deletePathValue(written.value, source);
                if (!deleted.ok) {
                    return attachIssueStep(deleted.issue, { id, kind: 'move' });
                }

                commitStagedPathRoots(value, deleted.value, [source, destination]);
                changes?.push(change);
                return next?.(value, changes);
            };
        },
        id,
        instruction,
        kind: 'move' as const,
        describe(): StepDescription {
            return description;
        },
    });
}

function assertDisjoint(source: FieldPath, destination: FieldPath): void {
    if (isPathPrefix(source, destination) || isPathPrefix(destination, source)) {
        throw new PlanError('invalid_path', 'move() source and destination paths must not overlap.');
    }
}

function missingIssue(path: FieldPath, id: string): ReturnType<typeof createIssue> {
    return createIssue({
        code: 'missing_field',
        message: 'Cannot move the selected path; its source is missing or undefined.',
        path,
        step: { id, kind: 'move' },
    });
}

function conflictIssue(path: FieldPath, id: string): ReturnType<typeof createIssue> {
    return createIssue({
        code: 'destination_conflict',
        message: 'Cannot move the selected path; its destination already exists.',
        path,
        step: { id, kind: 'move' },
    });
}
