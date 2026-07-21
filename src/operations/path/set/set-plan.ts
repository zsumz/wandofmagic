import type { WandChange } from '../../../core/change/receipt-types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { SetInstruction } from '../../../instructions/path/path-operation.js';

export interface SetPlan {
    readonly change: WandChange;
    readonly description: StepDescription;
    readonly id: string;
    readonly instruction: SetInstruction;
    readonly path: FieldPath;
    readonly replacement: unknown;
}
