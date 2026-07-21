import type { Coercer } from '../../../coerce/types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { CoercePathInstruction } from '../../../instructions/path/path-operation.js';

export interface CoercePathPlan {
    readonly coerce: Coercer<unknown, unknown>['run'];
    readonly coercerName: string;
    readonly description: StepDescription;
    readonly id: string;
    readonly instruction: CoercePathInstruction;
    readonly missing: MissingPolicy;
    readonly path: FieldPath;
}
