import type { StepDescription } from '../../../core/plan/description-types.js';
import type {
    RenameProjectionEntry,
    RenameProjectionStep,
} from '../../../core/plan/projection-step.js';
import type { FieldPath } from '../../../core/path/path.js';
import type { RenameInstruction } from '../../../instructions/flat/flat-operation.js';

export interface RenameEntry extends RenameProjectionEntry {
    readonly sourcePath: FieldPath;
}

export interface RenamePlan {
    readonly description: StepDescription;
    readonly entries: readonly RenameEntry[];
    readonly hasOverlappingMoves: boolean;
    readonly instruction: RenameInstruction;
    readonly projection: RenameProjectionStep;
    readonly sources: ReadonlySet<string>;
    readonly usesPresenceMask: boolean;
}
