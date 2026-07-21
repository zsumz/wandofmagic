import type { WandChange } from '../../../core/change/receipt-types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { TransformPathInstruction } from '../../../instructions/path/path-operation.js';
import type { ErasedTransform } from '../../../internal/type-boundary/callback.js';

export interface TransformPathPlan {
    readonly change: WandChange;
    readonly description: StepDescription;
    readonly id: string;
    readonly instruction: TransformPathInstruction;
    readonly missing: MissingPolicy;
    readonly path: FieldPath;
    readonly transform: ErasedTransform;
}
