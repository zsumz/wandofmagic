import type { DataRecord } from '../../../core/execution/data-record.js';
import type {
    ChangeCollector,
    PlanExecutor,
    StepOutcome,
} from '../../../core/plan/executable-step.js';
import {
    deleteField,
    hasOwn,
} from '../../../runtime/data-record/record-fields.js';
import type { RenamePlan } from './rename-plan.js';

export function compileRename(plan: RenamePlan, next: PlanExecutor | undefined): PlanExecutor {
    const { entries, hasOverlappingMoves, sources, usesPresenceMask } = plan;

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
                entry.source !== entry.destination
                && hasOwn(value, entry.destination)
                && !sources.has(entry.destination)
            ) {
                return entry.conflictIssue;
            }
        }

        if (!hasOverlappingMoves) {
            for (let index = 0; index < entries.length; index += 1) {
                const entry = entries[index];
                if (
                    entry === undefined
                    || entry.source === entry.destination
                    || (usesPresenceMask
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
}
