import type { DataRecord } from '../core/data-record.js';
import { freezeChange } from '../core/change.js';
import type { StepDescription } from '../core/description.js';
import { PlanError } from '../core/errors.js';
import type {
    ChangeCollector,
    ExecutableStep,
    PlanExecutor,
    StepOutcome,
} from '../core/executable-step.js';
import { createIssue } from '../core/issue.js';
import { fieldPath } from '../core/path.js';
import { deleteField, hasOwn } from '../runtime/data-record.js';
import { assertSafeKey } from '../runtime/safe-key.js';

export function createRenameStep(
    mapping: Readonly<Record<string, string>>,
    id: string,
): ExecutableStep {
    const rawEntries = Object.freeze(Object.entries(mapping));
    if (rawEntries.length === 0) {
        throw new PlanError('empty_operation', 'rename() requires at least one mapping.');
    }

    const destinations: Set<string> = new Set();
    for (const [source, destination] of rawEntries) {
        assertSafeKey(source);
        assertSafeKey(destination);
        if (destinations.has(destination)) {
            throw new PlanError(
                'duplicate_destination',
                `rename() maps more than one field to ${JSON.stringify(destination)}.`,
            );
        }
        destinations.add(destination);
    }
    const sources = new Set(rawEntries.map(([source]) => source));
    const hasOverlappingMoves = rawEntries.some(
        ([source, destination]) => source !== destination && sources.has(destination),
    );
    const usesPresenceMask = !hasOverlappingMoves && rawEntries.length <= 31;

    const entries = Object.freeze(rawEntries.map(([source, destination]) => {
        const from = fieldPath(source);
        const to = fieldPath(destination);
        return Object.freeze({
            change: freezeChange({ from, kind: 'rename', stepId: id, to }),
            conflictIssue: createIssue({
                code: 'destination_conflict',
                message: `Cannot rename ${source} to ${destination}; the destination already exists.`,
                path: to,
                step: { id, kind: 'rename' },
            }),
            destination,
            destinationPath: to,
            source,
            sourcePath: from,
        });
    }));

    const description: StepDescription = {
        id,
        kind: 'rename',
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
        compile(next: PlanExecutor | undefined): PlanExecutor {
            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                let presenceMask = 0;
                for (let index = 0; index < entries.length; index += 1) {
                    const entry = entries[index];
                    if (entry === undefined || !hasOwn(value, entry.source)) {
                        continue;
                    }
                    if (usesPresenceMask) {
                        presenceMask |= 1 << index;
                    }
                    if (
                        entry.source !== entry.destination &&
                        hasOwn(value, entry.destination) &&
                        !sources.has(entry.destination)
                    ) {
                        return entry.conflictIssue;
                    }
                }

                if (!hasOverlappingMoves) {
                    for (let index = 0; index < entries.length; index += 1) {
                        const entry = entries[index];
                        if (
                            entry === undefined ||
                            entry.source === entry.destination ||
                            (usesPresenceMask
                                ? (presenceMask & 1 << index) === 0
                                : !hasOwn(value, entry.source))
                        ) {
                            continue;
                        }

                        const fieldValue = value[entry.source];
                        deleteField(value, entry.source);
                        value[entry.destination] = fieldValue;
                        changes?.push(entry.change);
                    }
                    return next?.(value, changes);
                }

                const captured: Array<{
                    readonly entry: (typeof entries)[number];
                    readonly value: unknown;
                }> = [];
                for (const entry of entries) {
                    if (entry.source !== entry.destination && hasOwn(value, entry.source)) {
                        captured.push({ entry, value: value[entry.source] });
                    }
                }

                for (const { entry } of captured) {
                    deleteField(value, entry.source);
                }
                for (const { entry, value: fieldValue } of captured) {
                    value[entry.destination] = fieldValue;
                    changes?.push(entry.change);
                }
                return next?.(value, changes);
            };
        },
        id,
        instruction,
        kind: 'rename' as const,
        projection,
        describe(): StepDescription {
            return description;
        },
    });
}
