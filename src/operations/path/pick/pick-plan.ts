import type { WandChange } from '../../../core/change/receipt-types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { PickInstruction } from '../../../instructions/path/path-operation.js';

export interface PickPlan {
    readonly change: WandChange;
    readonly description: StepDescription;
    readonly id: string;
    readonly instruction: PickInstruction;
    readonly paths: readonly FieldPath[];
}
