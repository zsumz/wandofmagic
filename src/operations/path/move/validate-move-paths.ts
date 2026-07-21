import { PlanError } from '../../../core/plan/plan-error.js';
import type { FieldPath } from '../../../core/path/path.js';
import { isPathPrefix } from '../../../runtime/path/path-prefix.js';

export function assertDisjointMovePaths(source: FieldPath, destination: FieldPath): void {
    if (isPathPrefix(source, destination) || isPathPrefix(destination, source)) {
        throw new PlanError('invalid_path', 'move() source and destination paths must not overlap.');
    }
}
