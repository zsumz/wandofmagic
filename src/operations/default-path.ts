import { freezeChange } from '../core/change.js';
import type { DataRecord } from '../core/data-record.js';
import type { StepDescription } from '../core/description.js';
import type {
    ChangeCollector,
    ExecutableStep,
    PlanExecutor,
    StepOutcome,
} from '../core/executable-step.js';
import { attachIssueStep } from '../core/issue.js';
import type { Path } from '../core/path.js';
import { commitSetPathValue } from '../runtime/commit-set-path-value.js';
import { normalizePath } from '../runtime/normalize-path.js';
import { readPath } from '../runtime/read-path.js';

export function createDefaultPathStep(
    pathInput: Path,
    fallback: unknown,
    id: string,
): ExecutableStep {
    const path = normalizePath(pathInput);
    const change = freezeChange({ kind: 'default', path, stepId: id });
    const description: StepDescription = {
        id,
        kind: 'default',
        reads: [path],
        removes: [],
        writes: [path],
    };
    const instruction = Object.freeze({ fallback, id, kind: 'default-path' as const, path });

    return Object.freeze({
        compile(next: PlanExecutor | undefined): PlanExecutor {
            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                const read = readPath(value, path);
                if (read.status === 'failed') {
                    return attachIssueStep(read.issue, { id, kind: 'default' });
                }
                if (read.status !== 'missing' && read.value !== undefined) {
                    return next?.(value, changes);
                }
                const write = commitSetPathValue(value, path, fallback);
                if (!write.ok) {
                    return attachIssueStep(write.issue, { id, kind: 'default' });
                }
                changes?.push(change);
                return next?.(value, changes);
            };
        },
        id,
        instruction,
        kind: 'default' as const,
        describe(): StepDescription {
            return description;
        },
    });
}
