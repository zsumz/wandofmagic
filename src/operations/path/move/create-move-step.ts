import { freezeChange } from '../../../core/change/freeze-receipt.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import type {
    MissingPolicy,
    MoveConflictPolicy,
} from '../../../core/plan/operation-options.js';
import type { PathInput } from '../../../core/path/path.js';
import { normalizePath } from '../../../runtime/path/normalize-path.js';
import { compileMove } from './compile-move.js';
import type { MovePlan } from './move-plan.js';
import { assertDisjointMovePaths } from './validate-move-paths.js';

export function createMoveStep(
    sourceInput: PathInput,
    destinationInput: PathInput,
    missing: MissingPolicy,
    conflict: MoveConflictPolicy,
    id: string,
): ExecutableStep {
    const source = normalizePath(sourceInput);
    const destination = normalizePath(destinationInput);
    assertDisjointMovePaths(source, destination);

    const plan: MovePlan = Object.freeze({
        change: freezeChange({ from: source, kind: 'move', stepId: id, to: destination }),
        conflict,
        destination,
        id,
        missing,
        source,
    });
    const description: StepDescription = {
        id,
        kind: 'move',
        reads: [source, destination],
        removes: [source],
        writes: [destination],
    };
    const instruction = Object.freeze({
        conflict,
        destination,
        id,
        kind: 'move' as const,
        missing,
        source,
    });

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileMove(plan, next),
        describe: () => description,
        id,
        instruction,
        kind: 'move' as const,
    });
}
