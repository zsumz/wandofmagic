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
import type { PathInput } from '../core/path.js';
import { commitSetPathValue } from '../runtime/commit-set-path-value.js';
import { normalizePath } from '../runtime/normalize-path.js';

export function createSetStep(
    pathInput: PathInput,
    replacement: unknown,
    id: string,
): ExecutableStep {
    const path = normalizePath(pathInput);
    const change = freezeChange({ kind: 'set', path, stepId: id });
    const description: StepDescription = {
        id,
        kind: 'set',
        reads: [path],
        removes: [],
        writes: [path],
    };
    const instruction = Object.freeze({ id, kind: 'set' as const, path, replacement });

    return Object.freeze({
        compile(next: PlanExecutor | undefined): PlanExecutor {
            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                const result = commitSetPathValue(value, path, replacement);
                if (!result.ok) {
                    return attachIssueStep(result.issue, { id, kind: 'set' });
                }
                if (result.changed) {
                    changes?.push(change);
                }
                return next?.(value, changes);
            };
        },
        id,
        instruction,
        kind: 'set' as const,
        describe(): StepDescription {
            return description;
        },
    });
}
