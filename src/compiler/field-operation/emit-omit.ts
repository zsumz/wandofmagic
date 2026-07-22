import type { OmitInstruction } from '../../instructions/flat/flat-operation.js';
import { sourceString } from '../emitter/source-string.js';

export function emitOmit(instruction: OmitInstruction): readonly string[] {
    return instruction.keys.map((key) => `        delete $value[${sourceString(key)}];`);
}
