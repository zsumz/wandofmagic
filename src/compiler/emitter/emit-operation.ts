import type { FlatOperationInstruction } from '../../instructions/flat/flat-operation.js';
import { emitCoerce } from '../coerce-operation/emit-coerce.js';
import { CompilerError } from '../error/compiler-error.js';
import type { EmitterState } from './emitter-state.js';
import { emitDefault } from '../field-operation/emit-default.js';
import { emitDerive } from '../field-operation/emit-derive.js';
import { emitTransform } from '../field-operation/emit-transform.js';
import { emitTrim } from '../field-operation/emit-trim.js';

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
