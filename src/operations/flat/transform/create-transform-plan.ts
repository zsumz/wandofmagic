import { freezeChange } from '../../../core/change/freeze-receipt.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import { fieldPath } from '../../../core/path/path.js';
import type { ErasedTransform } from '../../../internal/type-boundary/callback.js';
import { assertSafeKey } from '../../../runtime/path/safe-key.js';
import type { TransformPlan } from './transform-plan.js';

export function createTransformPlan(
    key: string,
    transform: ErasedTransform,
    missing: MissingPolicy,
    id: string,
): TransformPlan {
    assertSafeKey(key);
    const path = fieldPath(key);

    return Object.freeze({
        change: freezeChange({ kind: 'transform', path, stepId: id }),
        description: {
            id,
            kind: 'transform' as const,
            reads: [path],
            removes: [],
            writes: [path],
        },
        id,
        instruction: Object.freeze({
            binding: transform,
            id,
            key,
            kind: 'transform' as const,
            missing,
        }),
        key,
        missing,
        path,
        transform,
    });
}
