import type { WandChange } from '../../../core/change/receipt-types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { DefaultInstruction } from '../../../instructions/flat/flat-operation.js';

export interface DefaultPlan {
    readonly change: WandChange;
    readonly description: StepDescription;
    readonly fallback: unknown;
    readonly id: string;
    readonly instruction: DefaultInstruction;
    readonly key: string;
    readonly path: FieldPath;
}
