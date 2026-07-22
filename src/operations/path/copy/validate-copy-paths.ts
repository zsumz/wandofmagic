import { PlanError } from '../../../core/plan/plan-error.js';
import type { FieldPath } from '../../../core/path/path.js';
import { isPathPrefix } from '../../../runtime/path/path-prefix.js';

export function assertCopyDestinationOutsideSource(
    source: FieldPath,
    destination: FieldPath,
): void {
    if (isPathPrefix(source, destination)) {
        throw new PlanError(
            'invalid_path',
            'copy() destination must not be the source or one of its descendants.',
        );
    }
}
