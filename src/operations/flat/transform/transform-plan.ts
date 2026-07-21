import type { WandChange } from '../../../core/change/receipt-types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { TransformInstruction } from '../../../instructions/flat/flat-operation.js';
import type { ErasedTransform } from '../../../internal/type-boundary/callback.js';

export interface TransformPlan {
    readonly change: WandChange;
    readonly description: StepDescription;
    readonly id: string;
    readonly instruction: TransformInstruction;
    readonly key: string;
    readonly missing: MissingPolicy;
    readonly path: FieldPath;
    readonly transform: ErasedTransform;
}
