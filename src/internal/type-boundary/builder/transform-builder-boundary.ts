import type {
    MissingOptions,
    MissingPolicy,
} from '../../../core/plan/operation-options.js';
import type { PathInput } from '../../../core/path/path.js';
import type { ErasedTransform } from '../callback.js';

export interface TransformBuilderBoundary {
    transform(
        path: PathInput,
        transform: ErasedTransform,
        options: MissingOptions<MissingPolicy>,
    ): object;
}
