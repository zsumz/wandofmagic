import type { Coercer } from '../../../coerce/types.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { CoerceInstruction } from '../../../instructions/flat/flat-operation.js';

export interface CoercePlan {
    readonly coerce: Coercer<unknown, unknown>['run'];
    readonly coercerName: string;
    readonly description: StepDescription;
    readonly id: string;
    readonly instruction: CoerceInstruction;
    readonly key: string;
    readonly missing: MissingPolicy;
    readonly path: FieldPath;
}
