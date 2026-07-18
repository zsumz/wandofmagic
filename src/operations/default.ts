import type { DataRecord } from '../core/data-record.js';
import { freezeChange } from '../core/change.js';
import type { StepDescription } from '../core/description.js';
import type {
    ChangeCollector,
    ExecutableStep,
    PlanExecutor,
    StepOutcome,
} from '../core/executable-step.js';
import { fieldPath } from '../core/path.js';
import { hasOwn } from '../runtime/data-record.js';
import { assertSafeKey } from '../runtime/safe-key.js';

export function createDefaultStep(key: string, fallback: unknown, id: string): ExecutableStep {
    assertSafeKey(key);
    const path = fieldPath(key);
    const change = freezeChange({ kind: 'default', path, stepId: id });
    const description: StepDescription = {
        id,
        kind: 'default',
        reads: [path],
        removes: [],
        writes: [path],
    };
    const instruction = Object.freeze({ fallback, id, key, kind: 'default' as const });

    return Object.freeze({
        compile(next: PlanExecutor | undefined): PlanExecutor {
            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                if (hasOwn(value, key) && value[key] !== undefined) {
                    return next?.(value, changes);
                }

                value[key] = fallback;
                changes?.push(change);
                return next?.(value, changes);
            };
        },
        id,
        instruction,
        kind: 'default' as const,
        describe(): StepDescription {
            return description;
        },
    });
}
