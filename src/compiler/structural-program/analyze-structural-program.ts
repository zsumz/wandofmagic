import type { FlatOperationInstruction } from '../../instructions/flat/flat-operation.js';
import type { OperationProgram } from '../../runtime/compiled-spell/operation-program-registry.js';
import type { StructuralProgram } from './structural-program.js';
import { touchesKey } from './touches-key.js';

/** Prove the subset whose rename and omit work can be fused into the input projection. */
export function analyzeStructuralProgram(program: OperationProgram): StructuralProgram | undefined {
    const rename = program[0];
    const omit = program[program.length - 1];
    if (rename?.kind !== 'rename' || omit?.kind !== 'omit') {
        return undefined;
    }

    const sources = new Set(rename.entries.map((entry) => entry.source));
    if (rename.entries.some((entry) =>
        entry.source !== entry.destination && sources.has(entry.destination))) {
        return undefined;
    }

    const candidateMiddle = program.slice(1, -1);
    if (!candidateMiddle.every(isFlatMiddleInstruction)) {
        return undefined;
    }
    const middle = Object.freeze(candidateMiddle);
    if (omit.keys.some((key) => middle.some((instruction) => touchesKey(instruction, key)))) {
        return undefined;
    }

    return Object.freeze({ middle, omit, rename });
}

function isFlatMiddleInstruction(
    instruction: OperationProgram[number],
): instruction is FlatOperationInstruction {
    return instruction.kind === 'coerce'
        || instruction.kind === 'default'
        || instruction.kind === 'derive'
        || instruction.kind === 'transform'
        || instruction.kind === 'trim';
}
