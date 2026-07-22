import { freezeChange } from '../../../core/change/freeze-receipt.js';
import type { PathInput } from '../../../core/path/path.js';
import { canonicalizePaths } from '../../../runtime/path/canonicalize-paths.js';
import type { OmitPathField } from './omit-paths-plan.js';

export function canonicalizeOmitPaths(
    pathInputs: readonly PathInput[],
    id: string,
): readonly OmitPathField[] {
    return Object.freeze(canonicalizePaths(pathInputs, 'omit').map((path) => Object.freeze({
        change: freezeChange({ kind: 'omit', path, stepId: id }),
        path,
    })));
}
