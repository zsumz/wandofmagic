import type { WandChange } from '../../../core/change/receipt-types.js';
import type {
    MissingPolicy,
    MoveConflictPolicy,
} from '../../../core/plan/operation-options.js';
import type { FieldPath } from '../../../core/path/path.js';

export interface MovePlan {
    readonly change: WandChange;
    readonly conflict: MoveConflictPolicy;
    readonly destination: FieldPath;
    readonly id: string;
    readonly missing: MissingPolicy;
    readonly source: FieldPath;
}
