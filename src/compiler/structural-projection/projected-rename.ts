import type { RenameFieldInstruction } from '../../instructions/flat/flat-operation.js';

export interface ProjectedRename extends RenameFieldInstruction {
    readonly index: number;
    readonly omitted: boolean;
}

export function projectRenames(
    entries: readonly RenameFieldInstruction[],
    omittedKeys: ReadonlySet<string>,
): readonly ProjectedRename[] {
    return entries
        .filter((entry) => entry.source !== entry.destination)
        .map((entry, index) => Object.freeze({
            ...entry,
            index,
            omitted: omittedKeys.has(entry.destination),
        }));
}
