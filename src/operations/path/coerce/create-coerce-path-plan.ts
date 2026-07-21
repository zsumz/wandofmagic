import type { Coercer } from '../../../coerce/types.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import type { Path } from '../../../core/path/path.js';
import { resolveCoercerInstruction } from '../../../instructions/coercer/coercer-registry.js';
import { normalizePath } from '../../../runtime/path/normalize-path.js';
import type { CoercePathPlan } from './coerce-path-plan.js';

export function createCoercePathPlan(
    pathInput: Path,
    coercer: Coercer<unknown, unknown>,
    missing: MissingPolicy,
    id: string,
): CoercePathPlan {
    const path = normalizePath(pathInput);
    const coercerName = coercer.name;
    const coerce = coercer.run;

    return Object.freeze({
        coerce,
        coercerName,
        description: {
            id,
            kind: 'coerce' as const,
            reads: [path],
            removes: [],
            writes: [path],
        },
        id,
        instruction: Object.freeze({
            coercer: resolveCoercerInstruction(coercer, coercerName, coerce),
            id,
            kind: 'coerce-path' as const,
            missing,
            path,
        }),
        missing,
        path,
    });
}
