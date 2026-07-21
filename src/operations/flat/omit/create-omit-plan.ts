import { freezeChange } from '../../../core/change/freeze-receipt.js';
import { PlanError } from '../../../core/plan/plan-error.js';
import { fieldPath } from '../../../core/path/path.js';
import { assertSafeKey } from '../../../runtime/path/safe-key.js';
import type { OmitPlan } from './omit-plan.js';

export function createOmitPlan(keys: readonly string[], id: string): OmitPlan {
    if (keys.length === 0) {
        throw new PlanError('empty_operation', 'omit() requires at least one field.');
    }
    for (const key of keys) {
        assertSafeKey(key);
    }

    const uniqueKeys = Object.freeze([...new Set(keys)]);
    const fields = Object.freeze(uniqueKeys.map((key) => {
        const path = fieldPath(key);
        return Object.freeze({
            change: freezeChange({ kind: 'omit', path, stepId: id }),
            key,
            path,
        });
    }));
    return Object.freeze({
        description: {
            id,
            kind: 'omit' as const,
            reads: fields.map((field) => field.path),
            removes: fields.map((field) => field.path),
            writes: [],
        },
        fields,
        id,
        instruction: Object.freeze({ id, keys: uniqueKeys, kind: 'omit' as const }),
        projection: Object.freeze({ fields, kind: 'omit' as const }),
    });
}
