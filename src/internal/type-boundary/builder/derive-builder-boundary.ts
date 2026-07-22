import type { StepOptions } from '../../../core/plan/operation-options.js';
import type { PathInput } from '../../../core/path/path.js';
import type { ErasedDerive } from '../callback.js';

export interface DeriveBuilderBoundary {
    derive(
        destination: PathInput,
        dependencies: readonly PathInput[],
        derive: ErasedDerive,
        options: StepOptions,
    ): object;
}
