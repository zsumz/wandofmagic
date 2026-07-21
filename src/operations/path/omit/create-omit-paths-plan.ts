import type { PathInput } from '../../../core/path/path.js';
import { canonicalizeOmitPaths } from './canonicalize-omit-paths.js';
import type { OmitPathsPlan } from './omit-paths-plan.js';

export function createOmitPathsPlan(
    pathInputs: readonly PathInput[],
    id: string,
): OmitPathsPlan {
    const fields = canonicalizeOmitPaths(pathInputs, id);
    const paths = Object.freeze(fields.map((field) => field.path));

    return Object.freeze({
        description: {
            id,
            kind: 'omit' as const,
            reads: paths,
            removes: paths,
            writes: [],
        },
        fields,
        id,
        instruction: Object.freeze({ id, kind: 'omit-paths' as const, paths }),
    });
}
