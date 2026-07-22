import { addBinding, type EmitterState } from '../../emitter/emitter-state.js';
import type { PathCoercionContext } from './emission-context.js';
import {
    emitBooleanPathCoercion,
    emitNumberPathCoercion,
    emitStringPathCoercion,
} from './emit-primitive-path-coercion.js';
import { emitResultPathCoercion } from './emit-result-path-coercion.js';

export function emitPresentPathCoercion(
    context: PathCoercionContext,
    state: EmitterState,
): readonly string[] {
    const { coercer } = context.instruction;
    switch (coercer.kind) {
        case 'boolean':
            return emitBooleanPathCoercion(context);
        case 'number':
            return emitNumberPathCoercion(context);
        case 'string':
            return emitStringPathCoercion(context);
        case 'custom': {
            const binding = addBinding(
                state,
                coercer.binding,
                'coercer',
                context.instruction.id,
            );
            return emitResultPathCoercion(
                context,
                `${binding}(${context.current})`,
                coercer.name,
            );
        }
        case 'iso-date':
            return emitResultPathCoercion(
                context,
                `$coerceIsoDate(${context.current})`,
                'iso-date',
            );
    }
}
