import type { Coercer } from '../../../coerce/types.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import { fieldPath } from '../../../core/path/path.js';
import { resolveCoercerInstruction } from '../../../instructions/coercer/coercer-registry.js';
import { assertSafeKey } from '../../../runtime/path/safe-key.js';
import type { CoercePlan } from './coerce-plan.js';

export function createCoercePlan(
    key: string,
    coercer: Coercer<unknown, unknown>,
    missing: MissingPolicy,
    id: string,
): CoercePlan {
    assertSafeKey(key);
    const coercerName = coercer.name;
    const coerce = coercer.run;
    const path = fieldPath(key);

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
            key,
            kind: 'coerce' as const,
            missing,
        }),
        key,
        missing,
        path,
    });
}
