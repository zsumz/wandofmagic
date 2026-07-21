import type { WandChange } from '../../../core/change/receipt-types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { TrimInstruction } from '../../../instructions/flat/flat-operation.js';

export interface TrimField {
    readonly change: WandChange;
    readonly key: string;
    readonly path: FieldPath;
}

export interface TrimPlan {
    readonly description: StepDescription;
    readonly fields: readonly TrimField[];
    readonly id: string;
    readonly instruction: TrimInstruction;
}
