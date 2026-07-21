import { createRenameEntry } from './create-rename-entry.js';
import type { RenamePlan } from './rename-plan.js';
import { validateRenameEntries } from './validate-rename-entries.js';

export function createRenamePlan(
    mapping: Readonly<Record<string, string>>,
    id: string,
): RenamePlan {
    const rawEntries = Object.freeze(Object.entries(mapping));
    validateRenameEntries(rawEntries);

    const sources = new Set(rawEntries.map(([source]) => source));
    const hasOverlappingMoves = rawEntries.some(
        ([source, destination]) => source !== destination && sources.has(destination),
    );
    const entries = Object.freeze(rawEntries.map(([source, destination]) =>
        createRenameEntry(source, destination, id)));
    const description = {
        id,
        kind: 'rename' as const,
        reads: entries.map((entry) => entry.sourcePath),
        removes: entries.map((entry) => entry.sourcePath),
        writes: entries.map((entry) => entry.destinationPath),
    };
    const projection = Object.freeze({
        entries,
        hasOverlappingMoves,
        kind: 'rename' as const,
    });
    const instruction = Object.freeze({
        entries: Object.freeze(entries.map(({ destination, source }) =>
            Object.freeze({ destination, source }))),
        id,
        kind: 'rename' as const,
    });

    return Object.freeze({
        description,
        entries,
        hasOverlappingMoves,
        instruction,
        projection,
        sources,
        usesPresenceMask: !hasOverlappingMoves && entries.length <= 31,
    });
}
