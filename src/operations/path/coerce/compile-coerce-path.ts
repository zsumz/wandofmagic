import type { CoerceResult } from '../../../coerce/types.js';
import { freezeChange } from '../../../core/change/freeze-receipt.js';
import type { WandChange } from '../../../core/change/receipt-types.js';
import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import { attachIssueStep } from '../../../core/issue/attach-step.js';
import { commitSetPathValue } from '../../../runtime/path/commit-set-path-value.js';
import { valueKind } from '../../../runtime/data-record/value-kind.js';
import { readPath } from '../../../runtime/path/read-path.js';
import {
    failedCoercePathIssue,
    missingCoercePathIssue,
    thrownCoercePathIssue,
} from './coerce-path-issues.js';
import type { CoercePathPlan } from './coerce-path-plan.js';

export function compileCoercePath(
    plan: CoercePathPlan,
    next: PlanExecutor | undefined,
): PlanExecutor {
    const { coerce, coercerName, id, missing, path } = plan;
    let cachedChange: WandChange | undefined;
    let cachedFromType: string | undefined;
    let cachedToType: string | undefined;

    return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
        const read = readPath(value, path);
        if (read.status === 'failed') {
            return attachIssueStep(read.issue, { id, kind: 'coerce' });
        }
        if (read.status === 'missing' || read.value === undefined) {
            return missing === 'skip'
                ? next?.(value, changes)
                : missingCoercePathIssue(path, id);
        }

        let converted: CoerceResult<unknown>;
        try {
            converted = coerce(read.value);
        } catch (cause) {
            return thrownCoercePathIssue(cause, coercerName, path, id);
        }
        if (!converted.ok) {
            return failedCoercePathIssue(converted, coercerName, path, id);
        }
        if (Object.is(read.value, converted.value)) {
            return next?.(value, changes);
        }

        const write = commitSetPathValue(value, path, converted.value);
        if (!write.ok) {
            return attachIssueStep(write.issue, { id, kind: 'coerce' });
        }
        if (changes !== undefined) {
            const fromType = valueKind(read.value);
            const toType = valueKind(converted.value);
            if (
                cachedChange === undefined
                || cachedFromType !== fromType
                || cachedToType !== toType
            ) {
                cachedFromType = fromType;
                cachedToType = toType;
                cachedChange = freezeChange({
                    coercer: coercerName,
                    fromType,
                    kind: 'coerce',
                    path,
                    stepId: id,
                    toType,
                });
            }
            changes.push(cachedChange);
        }
        return next?.(value, changes);
    };
}
