import type {
    FlatOperationInstruction,
    OmitInstruction,
    RenameInstruction,
} from '../../instructions/flat/flat-operation.js';

export interface StructuralProgram {
    readonly middle: readonly FlatOperationInstruction[];
    readonly omit: OmitInstruction;
    readonly rename: RenameInstruction;
}
