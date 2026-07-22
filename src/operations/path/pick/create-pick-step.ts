import { freezeChange } from '../../../core/change/freeze-receipt.js';
import type { ExecutableStep, PlanExecutor } from '../../../core/plan/executable-step.js';
import type { PathInput } from '../../../core/path/path.js';
import { canonicalizePaths } from '../../../runtime/path/canonicalize-paths.js';
import { compilePick } from './compile-pick.js';
import type { PickPlan } from './pick-plan.js';

export function createPickStep(
    pathInputs: readonly PathInput[],
    id: string,
): ExecutableStep {
    const paths = canonicalizePaths(pathInputs, 'pick');
    const plan: PickPlan = Object.freeze({
        change: freezeChange({ kind: 'pick', paths, stepId: id }),
        description: { id, kind: 'pick' as const, reads: paths, removes: [], writes: paths },
        id,
        instruction: Object.freeze({ id, kind: 'pick' as const, paths }),
        paths,
    });

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compilePick(plan, next),
        describe: () => plan.description,
        id,
        instruction: plan.instruction,
        kind: 'pick' as const,
    });
}
