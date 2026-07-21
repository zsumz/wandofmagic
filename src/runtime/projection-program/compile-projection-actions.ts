import type {
    OmitProjectionField,
    RenameProjectionEntry,
} from '../../core/plan/projection-step.js';
import type {
    CompiledRenameProjectionEntry,
    ProjectionAction,
} from './program-types.js';

export function compileProjectionActions(
    renameEntries: readonly RenameProjectionEntry[],
    omittedFields: readonly OmitProjectionField[],
): ReadonlyMap<string, ProjectionAction> {
    const actions: Map<string, ProjectionAction> = new Map();
    for (let index = 0; index < renameEntries.length; index += 1) {
        const entry = renameEntries[index];
        if (entry !== undefined) {
            mergeAction(actions, entry.source, { sourceIndex: index });
            mergeAction(actions, entry.destination, { destinationIndex: index });
        }
    }
    for (let index = 0; index < omittedFields.length; index += 1) {
        const field = omittedFields[index];
        if (field !== undefined) {
            mergeAction(actions, field.key, { omitIndex: index });
        }
    }
    return actions;
}

export function compileRenameEntry(
    entry: RenameProjectionEntry,
    actions: ReadonlyMap<string, ProjectionAction>,
): CompiledRenameProjectionEntry {
    const destinationOmitIndex = actions.get(entry.destination)?.omitIndex;
    if (destinationOmitIndex === undefined) {
        return Object.freeze({ ...entry });
    }
    return Object.freeze({ ...entry, destinationOmitIndex });
}

function mergeAction(
    actions: Map<string, ProjectionAction>,
    key: string,
    addition: ProjectionAction,
): void {
    actions.set(key, Object.freeze({ ...actions.get(key), ...addition }));
}
