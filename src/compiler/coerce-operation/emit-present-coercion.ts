import type { CoerceInstruction } from '../../instructions/flat/flat-operation.js';
import { addBinding, type EmitterState } from '../emitter/emitter-state.js';
import { emitBooleanCoercion } from './emit-boolean-coercion.js';
import { emitNumberCoercion } from './emit-number-coercion.js';
import { emitResultCoercer } from './emit-result-coercer.js';
import { emitStringCoercion } from './emit-string-coercion.js';

export function emitPresentCoercion(
    instruction: CoerceInstruction,
    operationIndex: number,
    state: EmitterState,
): string[] {
    switch (instruction.coercer.kind) {
        case 'boolean':
            return emitBooleanCoercion(instruction, operationIndex);
        case 'number':
            return emitNumberCoercion(instruction, operationIndex);
        case 'string':
            return emitStringCoercion(instruction, operationIndex);
        case 'custom': {
            const binding = addBinding(
                state,
                instruction.coercer.binding,
                'coercer',
                instruction.id,
            );
            return emitResultCoercer(
                instruction,
                operationIndex,
                `${binding}($current${String(operationIndex)})`,
                instruction.coercer.name,
            );
        }
        case 'iso-date':
            return emitResultCoercer(
                instruction,
                operationIndex,
                `$coerceIsoDate($current${String(operationIndex)})`,
                'iso-date',
            );
    }
}
