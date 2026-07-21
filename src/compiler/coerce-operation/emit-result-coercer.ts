import type { CoerceInstruction } from '../../instructions/flat/flat-operation.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { sourceString } from '../emitter/source-string.js';
import { emitConvertedAssignment } from './emit-converted-assignment.js';

export function emitResultCoercer(
    instruction: CoerceInstruction,
    operationIndex: number,
    invocation: string,
    name: string,
): string[] {
    const converted = `$converted${String(operationIndex)}`;
    const current = `$current${String(operationIndex)}`;
    const details = `{ coercer: ${sourceString(name)} }`;
    const step = { id: sourceString(instruction.id), kind: 'coerce' as const };
    const thrownFailure = failureCallSource({
        cause: '$cause',
        code: 'coercion_failed',
        details,
        message: sourceString(
            `The ${name} coercer threw while processing ${instruction.key}.`,
        ),
        path: sourceString(instruction.key),
        step,
    });
    const rejectedFailure = failureCallSource({
        code: 'coercion_failed',
        details: `$details${String(operationIndex)}`,
        message: `${converted}.message`,
        path: sourceString(instruction.key),
        step,
    });
    return [
        `        let ${converted};`,
        '        try {',
        `            ${converted} = ${invocation};`,
        '        } catch ($cause) {',
        `            ${thrownFailure}`,
        '        }',
        `        if (!${converted}.ok) {`,
        `            const $details${String(operationIndex)} = ${converted}.code === undefined`,
        `                ? ${details}`,
        `                : { coercerCode: ${converted}.code, coercer: ${sourceString(name)} };`,
        `            ${rejectedFailure}`,
        '        }',
        ...emitConvertedAssignment(instruction.key, current, `${converted}.value`),
    ];
}
