import { freezeChange } from '../../../core/change/freeze-receipt.js';
import { PlanError } from '../../../core/plan/plan-error.js';
import { fieldPath } from '../../../core/path/path.js';
import { assertSafeKey } from '../../../runtime/path/safe-key.js';
import type { TrimPlan } from './trim-plan.js';

export function createTrimPlan(keys: readonly string[], id: string): TrimPlan {
    if (keys.length === 0) {
        throw new PlanError('empty_operation', 'trim() requires at least one field.');
    }
    for (const key of keys) {
        assertSafeKey(key);
    }

    const uniqueKeys = Object.freeze([...new Set(keys)]);
    const fields = Object.freeze(uniqueKeys.map((key) => {
        const path = fieldPath(key);
        return Object.freeze({
            change: freezeChange({ kind: 'trim', path, stepId: id }),
            key,
            path,
        });
    }));
    return Object.freeze({
        description: {
            id,
            kind: 'trim' as const,
            reads: fields.map((field) => field.path),
            removes: [],
            writes: fields.map((field) => field.path),
        },
        fields,
        id,
        instruction: Object.freeze({ id, keys: uniqueKeys, kind: 'trim' as const }),
    });
}
