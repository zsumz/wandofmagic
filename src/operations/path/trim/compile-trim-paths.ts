import type { DataRecord } from '../../../core/execution/data-record.js';
import { attachIssueStep } from '../../../core/issue/attach-step.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import { commitStagedPathRoots } from '../../../runtime/path/commit-staged-path-roots.js';
import { readPath } from '../../../runtime/path/read-path.js';
import { setPathValue } from '../../../runtime/path/set-path-value.js';
import { invalidTrimPathValueIssue } from './trim-path-issues.js';
import type { TrimPathField, TrimPathsPlan } from './trim-paths-plan.js';

interface PendingTrim {
    readonly field: TrimPathField;
    readonly replacement: string;
}

export function compileTrimPaths(
    plan: TrimPathsPlan,
    next: PlanExecutor | undefined,
): PlanExecutor {
    return (value, changes) => executeTrimPaths(plan, next, value, changes);
}

function executeTrimPaths(
    plan: TrimPathsPlan,
    next: PlanExecutor | undefined,
    value: DataRecord,
    changes: ChangeCollector,
): StepOutcome {
    const pending: PendingTrim[] = [];
    for (const field of plan.fields) {
        const read = readPath(value, field.path);
        if (read.status === 'failed') {
            return attachIssueStep(read.issue, { id: plan.id, kind: 'trim' });
        }
        if (read.status === 'missing' || read.value === null || read.value === undefined) {
            continue;
        }
        if (typeof read.value !== 'string') {
            return invalidTrimPathValueIssue(field.path, plan.id);
        }
        const replacement = read.value.trim();
        if (replacement !== read.value) {
            pending.push({ field, replacement });
        }
    }

    let staged = value;
    for (const item of pending) {
        const written = setPathValue(staged, item.field.path, item.replacement);
        if (!written.ok) {
            return attachIssueStep(written.issue, { id: plan.id, kind: 'trim' });
        }
        staged = written.value;
    }
    if (pending.length > 0) {
        commitStagedPathRoots(value, staged, pending.map((item) => item.field.path));
        changes?.push(...pending.map((item) => item.field.change));
    }
    return next?.(value, changes);
}
