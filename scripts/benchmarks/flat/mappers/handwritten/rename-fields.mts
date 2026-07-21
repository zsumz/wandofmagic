import { throwIssue } from './issues.mts';

export function applyRename(
    snapshot: Record<string, unknown>,
    sources: Readonly<Record<string, unknown>>,
    present: Readonly<Record<string, boolean>>,
    source: string,
    destination: string,
): void {
    assertNoRenameConflict(present, source, destination);
    if (present[source] === true) {
        snapshot[destination] = sources[source];
    }
}

export function assertNoRenameConflict(
    present: Readonly<Record<string, boolean>>,
    source: string,
    destination: string,
): void {
    if (present[source] === true && present[destination] === true) {
        throwIssue({
            code: 'destination_conflict',
            id: 'rename:1',
            kind: 'rename',
            message: `Cannot rename ${source} to ${destination}; the destination already exists.`,
            path: destination,
        });
    }
}

export function isRenameSource(key: string): boolean {
    return key === 'first_name' || key === 'last_name' || key === 'password_hash';
}

export function isRenameDestination(key: string): boolean {
    return key === 'firstName' || key === 'lastName' || key === 'passwordHash';
}
