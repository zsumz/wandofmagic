import type { ExecutableStep } from '../../core/plan/executable-step.js';
import {
    compileProjectionActions,
    compileRenameEntry,
} from './compile-projection-actions.js';
import type { ProjectionProgram } from './program-types.js';
import { selectProjectionBoundary } from './select-projection-boundary.js';

export function compileProjectionProgram(
    steps: readonly ExecutableStep[],
): ProjectionProgram | undefined {
    const boundary = selectProjectionBoundary(steps);
    if (boundary === undefined) {
        return undefined;
    }

    const renameEntries = boundary.rename.entries.filter(
        (entry) => entry.source !== entry.destination,
    );
    const actions = compileProjectionActions(
        renameEntries,
        boundary.omit.fields,
    );
    const compiledEntries = Object.freeze(renameEntries.map(
        (entry) => compileRenameEntry(entry, actions),
    ));

    return Object.freeze({
        actions,
        omit: boundary.omit,
        renameEntries: compiledEntries,
    });
}
