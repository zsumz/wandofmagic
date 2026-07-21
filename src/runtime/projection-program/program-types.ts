import type {
    OmitProjectionStep,
    RenameProjectionEntry,
} from '../../core/plan/projection-step.js';

export interface ProjectionAction {
    readonly destinationIndex?: number;
    readonly omitIndex?: number;
    readonly sourceIndex?: number;
}

export interface CompiledRenameProjectionEntry extends RenameProjectionEntry {
    readonly destinationOmitIndex?: number;
}

export interface ProjectionProgram {
    readonly actions: ReadonlyMap<string, ProjectionAction>;
    readonly omit: OmitProjectionStep;
    readonly renameEntries: readonly CompiledRenameProjectionEntry[];
}
