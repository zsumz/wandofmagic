import { freezeChange } from '../../../core/change/freeze-receipt.js';
import { fieldPath } from '../../../core/path/path.js';
import { assertSafeKey } from '../../../runtime/path/safe-key.js';
import type { DefaultPlan } from './default-plan.js';

export function createDefaultPlan(key: string, fallback: unknown, id: string): DefaultPlan {
    assertSafeKey(key);
    const path = fieldPath(key);

    return Object.freeze({
        change: freezeChange({ kind: 'default', path, stepId: id }),
        description: {
            id,
            kind: 'default' as const,
            reads: [path],
            removes: [],
            writes: [path],
        },
        fallback,
        id,
        instruction: Object.freeze({ fallback, id, key, kind: 'default' as const }),
        key,
        path,
    });
}
