import type { Coercer } from '../../../coerce/types.js';
import type {
    MissingOptions,
    MissingPolicy,
} from '../../../core/plan/operation-options.js';
import type { PathInput } from '../../../core/path/path.js';

export interface CoerceBuilderBoundary {
    coerce(
        path: PathInput,
        coercer: Coercer<unknown, unknown>,
        options: MissingOptions<MissingPolicy>,
    ): object;
}
