import type { ExecutableStep } from '../../../core/plan/executable-step.js';
import type { PathInput } from '../../../core/path/path.js';
import { createOmitStep } from '../../../operations/flat/omit/create-omit-step.js';
import { createOmitPathsStep } from '../../../operations/path/omit/create-omit-paths-step.js';

export function createOmitDispatchStep(paths: readonly PathInput[], id: string): ExecutableStep {
    const keys: string[] = [];
    for (const path of paths) {
        if (typeof path !== 'string') {
            return createOmitPathsStep(paths, id);
        }
        keys.push(path);
    }
    return createOmitStep(keys, id);
}
