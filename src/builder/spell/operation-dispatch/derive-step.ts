import type { ExecutableStep } from '../../../core/plan/executable-step.js';
import type { PathInput } from '../../../core/path/path.js';
import type { ErasedDerive } from '../../../internal/type-boundary/callback.js';
import { createDeriveStep } from '../../../operations/flat/derive/create-derive-step.js';
import { createDerivePathStep } from '../../../operations/path/derive/create-derive-path-step.js';

export function createDeriveDispatchStep(
    destination: PathInput,
    dependencies: readonly PathInput[],
    derive: ErasedDerive,
    id: string,
): ExecutableStep {
    return typeof destination === 'string'
        ? createDeriveStep(destination, stringDependencies(dependencies), derive, id)
        : createDerivePathStep(destination, dependencies, derive, id);
}

function stringDependencies(dependencies: readonly PathInput[]): readonly string[] {
    return dependencies.map((dependency) => {
        if (typeof dependency !== 'string') {
            throw new TypeError('A flat derive() destination requires flat dependencies.');
        }
        return dependency;
    });
}
