import { failureCallSource } from '../../emitter/failure-call-source.js';
import { sourceString } from '../../emitter/source-string.js';
import type { PathCoercionContext } from './emission-context.js';
import { convertedAssignmentLines } from './emission-context.js';

export function emitResultPathCoercion(
    context: PathCoercionContext,
    invocation: string,
    name: string,
): readonly string[] {
    const suffix = String(context.operationIndex);
    const converted = `$converted${suffix}`;
    const details = `{ coercer: ${sourceString(name)} }`;
    const step = { id: sourceString(context.instruction.id), kind: 'coerce' as const };
    return [
        `        let ${converted};`,
        '        try {',
        `            ${converted} = ${invocation};`,
        '        } catch ($cause) {',
        `            ${failureCallSource({
            cause: '$cause',
            code: 'coercion_failed',
            details,
            message: sourceString(
                `The ${name} coercer threw while processing the selected path.`,
            ),
            path: context.path,
            step,
        })}`,
        '        }',
        `        if (!${converted}.ok) {`,
        `            const $details${suffix} = ${converted}.code === undefined`,
        `                ? ${details}`,
        `                : { coercerCode: ${converted}.code, coercer: ${sourceString(name)} };`,
        `            ${failureCallSource({
            code: 'coercion_failed',
            details: `$details${suffix}`,
            message: `${converted}.message`,
            path: context.path,
            step,
        })}`,
        '        }',
        ...convertedAssignmentLines(context, `${converted}.value`),
    ];
}
