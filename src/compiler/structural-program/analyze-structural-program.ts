import type { FlatProgram } from '../../instructions/flat/flat-operation.js';
import type { StructuralProgram } from './structural-program.js';
import { throwUnsupportedProgram } from './unsupported-program.js';
import { touchesKey } from './touches-key.js';

/** Prove the subset whose rename and omit work can be fused into the input projection. */
export function analyzeStructuralProgram(program: FlatProgram): StructuralProgram {
    const rename = program[0];
    const omit = program[program.length - 1];
    if (rename?.kind !== 'rename' || omit?.kind !== 'omit') {
        throwUnsupportedProgram(
            'Static trusted mappers currently require a leading rename and trailing omit.',
        );
    }
    if (rename.entries.length > 31 || omit.keys.length > 31) {
        throwUnsupportedProgram(
            'Static trusted mappers currently support at most 31 renames and omits.',
        );
    }

    const sources = new Set(rename.entries.map((entry) => entry.source));
    if (rename.entries.some((entry) =>
        entry.source !== entry.destination && sources.has(entry.destination))) {
        throwUnsupportedProgram(
            'Static trusted mappers do not yet support overlapping rename moves.',
        );
    }

    const middle = Object.freeze(program.slice(1, -1));
    if (middle.some((instruction) =>
        instruction.kind === 'rename' || instruction.kind === 'omit')) {
        throwUnsupportedProgram(
            'Static trusted mappers only support structural operations at plan edges.',
        );
    }
    if (omit.keys.some((key) => middle.some((instruction) => touchesKey(instruction, key)))) {
        throwUnsupportedProgram(
            'A trailing omit cannot be fused when a middle operation touches its field.',
        );
    }

    return Object.freeze({ middle, omit, rename });
}
