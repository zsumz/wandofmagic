import type { StepOptions } from '../../../core/plan/operation-options.js';
import type { PathInput } from '../../../core/path/path.js';

export interface PickBuilderBoundary {
    pick(paths: readonly PathInput[], options: StepOptions): object;
}
