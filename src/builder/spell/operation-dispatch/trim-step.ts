import type { ExecutableStep } from '../../../core/plan/executable-step.js';
import type { PathInput } from '../../../core/path/path.js';
import { createTrimStep } from '../../../operations/flat/trim/create-trim-step.js';
import { createTrimPathsStep } from '../../../operations/path/trim/create-trim-paths-step.js';

export function createTrimDispatchStep(paths: readonly PathInput[], id: string): ExecutableStep {
    const keys: string[] = [];
    for (const path of paths) {
        if (typeof path !== 'string') {
            return createTrimPathsStep(paths, id);
        }
        keys.push(path);
    }
    return createTrimStep(keys, id);
}
