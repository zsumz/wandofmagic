import type { StepOptions } from '../../../core/plan/operation-options.js';
import type { PathInput } from '../../../core/path/path.js';

export interface DefaultBuilderBoundary {
    default(path: PathInput, fallback: unknown, options: StepOptions): object;
}
