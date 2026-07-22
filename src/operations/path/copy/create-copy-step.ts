import { freezeChange } from '../../../core/change/freeze-receipt.js';
import type { StepDescription } from '../../../core/plan/description-types.js';
import type {
    ExecutableStep,
    PlanExecutor,
} from '../../../core/plan/executable-step.js';
import type {
    CopyConflictPolicy,
    MissingPolicy,
} from '../../../core/plan/operation-options.js';
import type { PathInput } from '../../../core/path/path.js';
import { normalizePath } from '../../../runtime/path/normalize-path.js';
import { compileCopy } from './compile-copy.js';
import type { CopyPlan } from './copy-plan.js';
import { assertCopyDestinationOutsideSource } from './validate-copy-paths.js';

export function createCopyStep(
    sourceInput: PathInput,
    destinationInput: PathInput,
    missing: MissingPolicy,
    conflict: CopyConflictPolicy,
    id: string,
): ExecutableStep {
    const source = normalizePath(sourceInput);
    const destination = normalizePath(destinationInput);
    assertCopyDestinationOutsideSource(source, destination);

    const plan: CopyPlan = Object.freeze({
        change: freezeChange({ from: source, kind: 'copy', stepId: id, to: destination }),
        conflict,
        destination,
        id,
        missing,
        source,
    });
    const description: StepDescription = {
        id,
        kind: 'copy',
        reads: [source, destination],
        removes: [],
        writes: [destination],
    };
    const instruction = Object.freeze({
        conflict,
        destination,
        id,
        kind: 'copy' as const,
        missing,
        source,
    });

    return Object.freeze({
        compile: (next: PlanExecutor | undefined) => compileCopy(plan, next),
        describe: () => description,
        id,
        instruction,
        kind: 'copy' as const,
    });
}
