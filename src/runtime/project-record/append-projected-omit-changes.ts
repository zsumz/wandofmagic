import type { WandChange } from '../../core/change/receipt-types.js';
import type { ProjectionProgram } from '../projection-program/program-types.js';

export function appendProjectedOmitChanges(
    changes: WandChange[] | undefined,
    program: ProjectionProgram,
    omitMask: number,
): void {
    if (changes === undefined) {
        return;
    }
    for (let index = 0; index < program.omit.fields.length; index += 1) {
        const field = program.omit.fields[index];
        if (field !== undefined && (omitMask & 1 << index) !== 0) {
            changes.push(field.change);
        }
    }
}
