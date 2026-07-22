import type { OperationInstruction } from '../../instructions/path/path-operation.js';
import { emitCoerce } from '../coerce-operation/emit-coerce.js';
import type { EmitterState } from './emitter-state.js';
import { emitDefault } from '../field-operation/emit-default.js';
import { emitDerive } from '../field-operation/emit-derive.js';
import { emitOmit } from '../field-operation/emit-omit.js';
import { emitRename } from '../field-operation/emit-rename.js';
import { emitTransform } from '../field-operation/emit-transform.js';
import { emitTrim } from '../field-operation/emit-trim.js';
import { emitCopy } from '../path-operation/emit-copy.js';
import { emitCoercePath } from '../path-operation/emit-coerce-path.js';
import { emitDefaultPath } from '../path-operation/emit-default-path.js';
import { emitDerivePath } from '../path-operation/emit-derive-path.js';
import { emitMove } from '../path-operation/emit-move.js';
import { emitOmitPaths } from '../path-operation/emit-omit-paths.js';
import { emitPick } from '../path-operation/emit-pick.js';
import { emitSetPath } from '../path-operation/emit-set-path.js';
import { emitTransformPath } from '../path-operation/emit-transform-path.js';
import { emitTrimPaths } from '../path-operation/emit-trim-paths.js';

export function emitOperation(
    instruction: OperationInstruction,
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
            return emitOmit(instruction);
        case 'rename':
            return emitRename(instruction, operationIndex);
        case 'copy':
            return emitCopy(instruction, operationIndex);
        case 'default-path':
            return emitDefaultPath(instruction, operationIndex, state);
        case 'derive-path':
            return emitDerivePath(instruction, operationIndex, state);
        case 'move':
            return emitMove(instruction, operationIndex);
        case 'omit-paths':
            return emitOmitPaths(instruction, operationIndex);
        case 'pick':
            return emitPick(instruction, operationIndex);
        case 'set':
            return emitSetPath(instruction, operationIndex, state);
        case 'transform-path':
            return emitTransformPath(instruction, operationIndex, state);
        case 'trim-paths':
            return emitTrimPaths(instruction, operationIndex);
        case 'coerce-path':
            return emitCoercePath(instruction, operationIndex, state);
    }
}
