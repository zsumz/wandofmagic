import type { WandChange } from '../../../core/change/receipt-types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { DeriveInstruction } from '../../../instructions/flat/flat-operation.js';
import type { ErasedDerive } from '../../../internal/type-boundary/callback.js';

export interface DeriveDependency {
    readonly dependency: string;
    readonly path: FieldPath;
}

export interface DerivePlan {
    readonly change: WandChange;
    readonly dependencies: readonly DeriveDependency[];
    readonly derive: ErasedDerive;
    readonly description: StepDescription;
    readonly id: string;
    readonly instruction: DeriveInstruction;
    readonly key: string;
    readonly path: FieldPath;
}
