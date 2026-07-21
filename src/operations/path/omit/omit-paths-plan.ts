import type { WandChange } from '../../../core/change/receipt-types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { OmitPathsInstruction } from '../../../instructions/path/path-operation.js';

export interface OmitPathField {
    readonly change: WandChange;
    readonly path: FieldPath;
}

export interface OmitPathsPlan {
    readonly description: StepDescription;
    readonly fields: readonly OmitPathField[];
    readonly id: string;
    readonly instruction: OmitPathsInstruction;
}
