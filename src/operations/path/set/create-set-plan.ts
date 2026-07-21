import { freezeChange } from '../../../core/change/freeze-receipt.js';
import type { PathInput } from '../../../core/path/path.js';
import { normalizePath } from '../../../runtime/path/normalize-path.js';
import type { SetPlan } from './set-plan.js';

export function createSetPlan(
    pathInput: PathInput,
    replacement: unknown,
    id: string,
): SetPlan {
    const path = normalizePath(pathInput);

    return Object.freeze({
        change: freezeChange({ kind: 'set', path, stepId: id }),
        description: {
            id,
            kind: 'set' as const,
            reads: [path],
            removes: [],
            writes: [path],
        },
        id,
        instruction: Object.freeze({ id, kind: 'set' as const, path, replacement }),
        path,
        replacement,
    });
}
