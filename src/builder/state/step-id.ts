import { PlanError } from '../../core/plan/plan-error.js';
import type { ExecutableStep } from '../../core/plan/executable-step.js';
import type { StepKind } from '../../core/plan/step-kind.js';

const validStepId = /^[a-z0-9][a-z0-9._:/-]*$/i;

export function resolveStepId(
    kind: StepKind,
    requested: string | undefined,
    position: number,
): string {
    const id = requested ?? `${kind}:${String(position)}`;
    if (!validStepId.test(id)) {
        throw new PlanError(
            'invalid_step_id',
            'Step IDs must begin with an alphanumeric character and contain only letters, numbers, ., _, :, /, or -.',
        );
    }

    return id;
}

export function assertUniqueStepId(steps: readonly ExecutableStep[], id: string): void {
    if (steps.some((step) => step.id === id)) {
        throw new PlanError(
            'duplicate_step_id',
            `The step ID ${JSON.stringify(id)} is already in use.`,
        );
    }
}
