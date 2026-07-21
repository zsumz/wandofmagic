import type { CoerceInstruction } from '../../instructions/flat/flat-operation.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitCoercionFailure(
    instruction: CoerceInstruction,
    message: string,
    details: string,
    spaces: number,
): string[] {
    const indent = ' '.repeat(spaces);
    const failure = failureCallSource({
        code: 'coercion_failed',
        details,
        message: sourceString(message),
        path: sourceString(instruction.key),
        step: { id: sourceString(instruction.id), kind: 'coerce' },
    });
    return [`${indent}${failure}`];
}
