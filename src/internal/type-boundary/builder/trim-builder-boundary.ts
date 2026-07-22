import type { StepOptions } from '../../../core/plan/operation-options.js';
import type { PathInput } from '../../../core/path/path.js';

export interface TrimBuilderBoundary {
    trim(paths: readonly PathInput[], options: StepOptions): object;
}
