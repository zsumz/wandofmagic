import type { CoercePathInstruction } from '../../../instructions/path/path-operation.js';
import { failureCallSource } from '../../emitter/failure-call-source.js';
import { sourceString } from '../../emitter/source-string.js';

export interface PathCoercionContext {
    readonly current: string;
    readonly instruction: CoercePathInstruction;
    readonly operationIndex: number;
    readonly path: string;
    readonly read: string;
}

export function coercionFailureLines(
    context: PathCoercionContext,
    message: string,
    details: string,
    spaces: number,
): readonly string[] {
    const failure = failureCallSource({
        code: 'coercion_failed',
        details,
        message: sourceString(message),
        path: context.path,
        step: { id: sourceString(context.instruction.id), kind: 'coerce' },
    });
    return [`${' '.repeat(spaces)}${failure}`];
}

export function convertedAssignmentLines(
    context: PathCoercionContext,
    converted: string,
): readonly string[] {
    const write = `$coercePathWrite${String(context.operationIndex)}`;
    const readIsCurrent = context.instruction.coercer.kind === 'custom' ? '' : ' true,';
    return [
        `        if (!Object.is(${context.current}, ${converted})) {`,
        `            const ${write} = $commitRead(`,
        `                $value, ${context.path}, ${context.read}, ${converted},`
            + ` $ownership,${readIsCurrent}`,
        '            );',
        `            if (!${write}.ok) {`,
        `                $failIssue($WandError, ${write}.issue,`
            + ` ${sourceString(context.instruction.id)}, "coerce");`,
        '            }',
        '        }',
    ];
}
