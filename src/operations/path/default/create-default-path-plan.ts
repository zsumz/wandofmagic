import { freezeChange } from '../../../core/change/freeze-receipt.js';
import type { Path } from '../../../core/path/path.js';
import { normalizePath } from '../../../runtime/path/normalize-path.js';
import type { DefaultPathPlan } from './default-path-plan.js';

export function createDefaultPathPlan(
    pathInput: Path,
    fallback: unknown,
    id: string,
): DefaultPathPlan {
    const path = normalizePath(pathInput);

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
        instruction: Object.freeze({ fallback, id, kind: 'default-path' as const, path }),
        path,
    });
}
