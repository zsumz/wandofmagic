import { freezeChange } from '../../../core/change/freeze-receipt.js';
import { PlanError } from '../../../core/plan/plan-error.js';
import { fieldPath } from '../../../core/path/path.js';
import type { ErasedDerive } from '../../../internal/type-boundary/callback.js';
import { assertSafeKey } from '../../../runtime/path/safe-key.js';
import type { DerivePlan } from './derive-plan.js';

export function createDerivePlan(
    key: string,
    dependencies: readonly string[],
    derive: ErasedDerive,
    id: string,
): DerivePlan {
    validateDeriveInput(key, dependencies);

    const uniqueDependencies = Object.freeze([...new Set(dependencies)]);
    if (uniqueDependencies.length !== dependencies.length) {
        throw new PlanError('duplicate_dependency', 'derive() dependencies must be unique.');
    }

    const path = fieldPath(key);
    const dependencyFields = Object.freeze(uniqueDependencies.map((dependency) => Object.freeze({
        dependency,
        path: fieldPath(dependency),
    })));
    const sourcePaths = dependencyFields.map((field) => field.path);

    return Object.freeze({
        change: freezeChange({ kind: 'derive', path, sources: sourcePaths, stepId: id }),
        dependencies: dependencyFields,
        derive,
        description: {
            id,
            kind: 'derive' as const,
            reads: sourcePaths,
            removes: [],
            writes: [path],
        },
        id,
        instruction: Object.freeze({
            binding: derive,
            dependencies: uniqueDependencies,
            id,
            key,
            kind: 'derive' as const,
        }),
        key,
        path,
    });
}

function validateDeriveInput(key: string, dependencies: readonly string[]): void {
    assertSafeKey(key);
    if (dependencies.length === 0) {
        throw new PlanError('empty_operation', 'derive() requires at least one dependency.');
    }
    for (const dependency of dependencies) {
        assertSafeKey(dependency);
    }
}
