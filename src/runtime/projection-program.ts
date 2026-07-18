import type { ExecutableStep } from '../core/executable-step.js';
import type {
    OmitProjectionStep,
    RenameProjectionEntry,
} from '../core/projection-step.js';

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

export function compileProjectionProgram(
    steps: readonly ExecutableStep[],
): ProjectionProgram | undefined {
    const rename = steps[0]?.projection;
    const omit = steps[steps.length - 1]?.projection;
    if (
        rename?.kind !== 'rename' ||
        omit?.kind !== 'omit' ||
        rename.hasOverlappingMoves ||
        rename.entries.length > 31 ||
        omit.fields.length > 31
    ) {
        return undefined;
    }

    const middle = steps.slice(1, -1);
    if (omit.fields.some((field) => middle.some((step) => stepTouches(step, field.key)))) {
        return undefined;
    }

    const projectedRenameEntries = rename.entries.filter(
        (entry) => entry.source !== entry.destination,
    );
    const actions: Map<string, ProjectionAction> = new Map();
    for (let index = 0; index < projectedRenameEntries.length; index += 1) {
        const entry = projectedRenameEntries[index];
        if (entry !== undefined) {
            mergeAction(actions, entry.source, { sourceIndex: index });
            mergeAction(actions, entry.destination, { destinationIndex: index });
        }
    }
    for (let index = 0; index < omit.fields.length; index += 1) {
        const field = omit.fields[index];
        if (field !== undefined) {
            mergeAction(actions, field.key, { omitIndex: index });
        }
    }
    const renameEntries = Object.freeze(projectedRenameEntries.map(
        (entry) => compileRenameEntry(entry, actions),
    ));
    return Object.freeze({ actions, omit, renameEntries });
}

function compileRenameEntry(
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

function stepTouches(step: ExecutableStep, key: string): boolean {
    const description = step.describe();
    return [...description.reads, ...description.removes, ...description.writes].some(
        (path) => path[0] === key,
    );
}
