import { freezeChange } from '../../../core/change/freeze-receipt.js';
import { PlanError } from '../../../core/plan/plan-error.js';
import type {
    FieldPath,
    Path,
    PathInput,
} from '../../../core/path/path.js';
import type { ErasedDerive } from '../../../internal/type-boundary/callback.js';
import { normalizePath } from '../../../runtime/path/normalize-path.js';
import { isPathPrefix } from '../../../runtime/path/path-prefix.js';
import type { DerivePathPlan } from './derive-path-plan.js';

export function createDerivePathPlan(
    destinationInput: Path,
    dependencyInputs: readonly PathInput[],
    derive: ErasedDerive,
    id: string,
): DerivePathPlan {
    if (dependencyInputs.length === 0) {
        throw new PlanError('empty_operation', 'derive() requires at least one dependency.');
    }
    const destination = normalizePath(destinationInput);
    const dependencies: FieldPath[] = [];
    for (const dependencyInput of dependencyInputs) {
        const dependency = normalizePath(dependencyInput);
        if (dependencies.some((candidate) => samePath(candidate, dependency))) {
            throw new PlanError('duplicate_dependency', 'derive() dependencies must be unique.');
        }
        dependencies.push(dependency);
    }
    const frozenDependencies = Object.freeze(dependencies);
    return Object.freeze({
        change: freezeChange({
            kind: 'derive',
            path: destination,
            sources: frozenDependencies,
            stepId: id,
        }),
        dependencies: frozenDependencies,
        derive,
        description: {
            id,
            kind: 'derive' as const,
            reads: frozenDependencies,
            removes: [],
            writes: [destination],
        },
        destination,
        id,
        instruction: Object.freeze({
            binding: derive,
            dependencies: frozenDependencies,
            destination,
            id,
            kind: 'derive-path' as const,
        }),
    });
}

function samePath(left: FieldPath, right: FieldPath): boolean {
    return left.length === right.length && isPathPrefix(left, right);
}
