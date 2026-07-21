import { freezeChange } from '../../../core/change/freeze-receipt.js';
import { createIssue } from '../../../core/issue/create-issue.js';
import { fieldPath } from '../../../core/path/path.js';
import type { RenameEntry } from './rename-plan.js';

export function createRenameEntry(
    source: string,
    destination: string,
    id: string,
): RenameEntry {
    const sourcePath = fieldPath(source);
    const destinationPath = fieldPath(destination);
    return Object.freeze({
        change: freezeChange({
            from: sourcePath,
            kind: 'rename',
            stepId: id,
            to: destinationPath,
        }),
        conflictIssue: createIssue({
            code: 'destination_conflict',
            message: `Cannot rename ${source} to ${destination}; the destination already exists.`,
            path: destinationPath,
            step: { id, kind: 'rename' },
        }),
        destination,
        destinationPath,
        source,
        sourcePath,
    });
}
