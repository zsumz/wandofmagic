import type { PickInstruction } from '../../instructions/path/path-operation.js';
import type { EmitterState } from '../emitter/emitter-state.js';
import { emitPickProjection } from './pick/emit-pick-projection.js';

export function emitPick(
    instruction: PickInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    return emitPickProjection(instruction, operationIndex, state);
}
