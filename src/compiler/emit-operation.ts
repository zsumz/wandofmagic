import type { FlatOperationInstruction } from '../instructions/flat-operation.js';
import { CompilerError } from './compiler-error.js';
import { emitCoerce } from './emit-coerce-operation.js';
import {
    emitDefault,
    emitDerive,
    emitTransform,
    emitTrim,
} from './emit-field-operation.js';
import type { EmitterState } from './emitter-state.js';

export function emitOperation(
    instruction: FlatOperationInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    switch (instruction.kind) {
        case 'coerce':
            return emitCoerce(instruction, operationIndex, state);
        case 'default':
            return emitDefault(instruction, state);
        case 'derive':
            return emitDerive(instruction, operationIndex, state);
        case 'transform':
            return emitTransform(instruction, operationIndex, state);
        case 'trim':
            return emitTrim(instruction, operationIndex);
        case 'omit':
        case 'rename':
            throw new CompilerError(
                'unsupported_program',
                'Structural instructions may only appear at the proven plan edges.',
            );
    }
}
