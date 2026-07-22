import type { WandChange } from '../../../core/change/receipt-types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { TrimPathsInstruction } from '../../../instructions/path/path-operation.js';

export interface TrimPathField {
    readonly change: WandChange;
    readonly path: FieldPath;
}

export interface TrimPathsPlan {
    readonly description: StepDescription;
    readonly fields: readonly TrimPathField[];
    readonly id: string;
    readonly instruction: TrimPathsInstruction;
}
