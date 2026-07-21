import type { WandChange } from '../../../core/change/receipt-types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { OmitProjectionStep } from '../../../core/plan/projection-step.js';
import type { OmitInstruction } from '../../../instructions/flat/flat-operation.js';

export interface OmitField {
    readonly change: WandChange;
    readonly key: string;
    readonly path: FieldPath;
}

export interface OmitPlan {
    readonly description: StepDescription;
    readonly fields: readonly OmitField[];
    readonly id: string;
    readonly instruction: OmitInstruction;
    readonly projection: OmitProjectionStep;
}
