import { PlanError } from '../../../core/plan/plan-error.js';
import { assertSafeKey } from '../../../runtime/path/safe-key.js';

export function validateRenameEntries(
    entries: ReadonlyArray<readonly [string, string]>,
): void {
    if (entries.length === 0) {
        throw new PlanError('empty_operation', 'rename() requires at least one mapping.');
    }

    const destinations: Set<string> = new Set();
    for (const [source, destination] of entries) {
        assertSafeKey(source);
        assertSafeKey(destination);
        if (destinations.has(destination)) {
            throw new PlanError(
                'duplicate_destination',
                `rename() maps more than one field to ${JSON.stringify(destination)}.`,
            );
        }
        destinations.add(destination);
    }
}
