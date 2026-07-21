import type { WandChange } from '../../../core/change/receipt-types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { DefaultPathInstruction } from '../../../instructions/path/path-operation.js';

export interface DefaultPathPlan {
    readonly change: WandChange;
    readonly description: StepDescription;
    readonly fallback: unknown;
    readonly id: string;
    readonly instruction: DefaultPathInstruction;
    readonly path: FieldPath;
}
