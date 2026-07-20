import type {
    FlatOperationInstruction,
    FlatProgram,
    OmitInstruction,
    RenameInstruction,
} from '../instructions/flat-operation.js';
import { CompilerError } from './compiler-error.js';

export interface StructuralProgram {
    readonly middle: readonly FlatOperationInstruction[];
    readonly omit: OmitInstruction;
    readonly rename: RenameInstruction;
}

/** Prove the subset whose rename and omit work can be fused into the input projection. */
export function analyzeStructuralProgram(program: FlatProgram): StructuralProgram {
    const rename = program[0];
    const omit = program[program.length - 1];
    if (rename?.kind !== 'rename' || omit?.kind !== 'omit') {
        throwUnsupported('Static trusted mappers currently require a leading rename and trailing omit.');
    }
    if (rename.entries.length > 31 || omit.keys.length > 31) {
        throwUnsupported('Static trusted mappers currently support at most 31 renames and omits.');
    }

    const sources = new Set(rename.entries.map((entry) => entry.source));
    if (rename.entries.some((entry) =>
        entry.source !== entry.destination && sources.has(entry.destination))) {
        throwUnsupported('Static trusted mappers do not yet support overlapping rename moves.');
    }

    const middle = Object.freeze(program.slice(1, -1));
    if (middle.some((instruction) => instruction.kind === 'rename' || instruction.kind === 'omit')) {
        throwUnsupported('Static trusted mappers only support structural operations at plan edges.');
    }
    if (omit.keys.some((key) => middle.some((instruction) => touchesKey(instruction, key)))) {
        throwUnsupported('A trailing omit cannot be fused when a middle operation touches its field.');
    }

    return Object.freeze({ middle, omit, rename });
}

function touchesKey(instruction: FlatOperationInstruction, key: string): boolean {
    switch (instruction.kind) {
        case 'coerce':
        case 'default':
        case 'transform':
            return instruction.key === key;
        case 'derive':
            return instruction.key === key || instruction.dependencies.includes(key);
        case 'trim':
            return instruction.keys.includes(key);
        case 'omit':
            return instruction.keys.includes(key);
        case 'rename':
            return instruction.entries.some((entry) =>
                entry.source === key || entry.destination === key);
    }
}

function throwUnsupported(message: string): never {
    throw new CompilerError('unsupported_program', message);
}
