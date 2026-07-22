import type { WandChange } from '../../../core/change/receipt-types.js';
import type {
    CopyConflictPolicy,
    MissingPolicy,
} from '../../../core/plan/operation-options.js';
import type { FieldPath } from '../../../core/path/path.js';

export interface CopyPlan {
    readonly change: WandChange;
    readonly conflict: CopyConflictPolicy;
    readonly destination: FieldPath;
    readonly id: string;
    readonly missing: MissingPolicy;
    readonly source: FieldPath;
}
