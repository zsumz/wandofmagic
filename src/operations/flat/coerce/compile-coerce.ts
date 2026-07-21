import type { CoerceResult } from '../../../coerce/types.js';
import { freezeChange } from '../../../core/change/freeze-receipt.js';
import type { WandChange } from '../../../core/change/receipt-types.js';
import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import { hasOwn } from '../../../runtime/data-record/record-fields.js';
import { valueKind } from '../../../runtime/data-record/value-kind.js';
import {
    failedCoerceIssue,
    missingCoerceIssue,
    thrownCoerceIssue,
} from './coerce-issues.js';
import type { CoercePlan } from './coerce-plan.js';

export function compileCoerce(plan: CoercePlan, next: PlanExecutor | undefined): PlanExecutor {
    const { coerce, coercerName, id, key, missing, path } = plan;
    let cachedChange: WandChange | undefined;
    let cachedFromType: string | undefined;
    let cachedToType: string | undefined;

    return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
        let current: unknown;
        if (hasOwn(value, key)) {
            current = value[key];
        }
        if (current === undefined) {
            if (missing === 'skip') {
                return next?.(value, changes);
            }
            return missingCoerceIssue(key, path, id);
        }

        let converted: CoerceResult<unknown>;
        try {
            converted = coerce(current);
        } catch (cause) {
            return thrownCoerceIssue(cause, coercerName, key, path, id);
        }
        if (!converted.ok) {
            return failedCoerceIssue(converted, coercerName, path, id);
        }
        if (Object.is(current, converted.value)) {
            return next?.(value, changes);
        }

        value[key] = converted.value;
        if (changes !== undefined) {
            const fromType = valueKind(current);
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
