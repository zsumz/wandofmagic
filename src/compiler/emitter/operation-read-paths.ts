import type { FieldPath } from '../../core/path/path.js';
import type { OperationInstruction } from '../../instructions/path/path-operation.js';

export function operationReadPaths(instruction: OperationInstruction): readonly FieldPath[] {
    switch (instruction.kind) {
        case 'coerce-path':
        case 'default-path':
        case 'transform-path':
            return [instruction.path];
        case 'copy':
        case 'move':
            return [instruction.source, instruction.destination];
        case 'derive-path':
            return [instruction.destination, ...instruction.dependencies];
        case 'omit-paths':
        case 'pick':
        case 'trim-paths':
            return instruction.paths;
        case 'coerce':
        case 'default':
        case 'derive':
        case 'omit':
        case 'rename':
        case 'set':
        case 'transform':
        case 'trim':
            return [];
    }
}
