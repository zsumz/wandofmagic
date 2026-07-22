import type { WandChange } from '../../../core/change/receipt-types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { DerivePathInstruction } from '../../../instructions/path/path-operation.js';
import type { ErasedDerive } from '../../../internal/type-boundary/callback.js';

export interface DerivePathPlan {
    readonly change: WandChange;
    readonly dependencies: readonly FieldPath[];
    readonly derive: ErasedDerive;
    readonly description: StepDescription;
    readonly destination: FieldPath;
    readonly id: string;
    readonly instruction: DerivePathInstruction;
}
