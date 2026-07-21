import type { ExecutableStep } from '../../core/plan/executable-step.js';
import type {
    OmitProjectionStep,
    RenameProjectionStep,
} from '../../core/plan/projection-step.js';

export interface ProjectionBoundary {
    readonly omit: OmitProjectionStep;
    readonly rename: RenameProjectionStep;
}

export function selectProjectionBoundary(
    steps: readonly ExecutableStep[],
): ProjectionBoundary | undefined {
    const rename = steps[0]?.projection;
    const omit = steps[steps.length - 1]?.projection;
    if (
        rename?.kind !== 'rename'
        || omit?.kind !== 'omit'
        || rename.hasOverlappingMoves
        || rename.entries.length > 31
        || omit.fields.length > 31
    ) {
        return undefined;
    }

    const middle = steps.slice(1, -1);
    if (omit.fields.some((field) => middle.some((step) => stepTouches(step, field.key)))) {
        return undefined;
    }

    return { omit, rename };
}

function stepTouches(step: ExecutableStep, key: string): boolean {
    const description = step.describe();
    return [...description.reads, ...description.removes, ...description.writes].some(
        (path) => path[0] === key,
    );
}
