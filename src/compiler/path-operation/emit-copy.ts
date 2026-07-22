import type { CopyInstruction } from '../../instructions/path/path-operation.js';
import type { EmitterState } from '../emitter/emitter-state.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { pathSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitCopy(
    instruction: CopyInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    const suffix = String(operationIndex);
    const source = pathSource(instruction.source, state);
    const destination = pathSource(instruction.destination, state);
    const sourceRead = `$copySource${suffix}`;
    const destinationRead = `$copyDestination${suffix}`;
    const write = `$copyWrite${suffix}`;
    const step = { id: sourceString(instruction.id), kind: 'copy' as const };
    const lines = [
        `        const ${sourceRead} = $readPath($value, ${source});`,
        `        if (${sourceRead}.status === "failed") {`,
        `            $failIssue($WandError, ${sourceRead}.issue, ${step.id}, "copy");`,
        '        }',
        `        if (${sourceRead}.status === "missing" || ${sourceRead}.value === undefined) {`,
    ];
    if (instruction.missing === 'error') {
        lines.push(`            ${failureCallSource({
            code: 'missing_field',
            message: sourceString(
                'Cannot copy the selected path; its source is missing or undefined.',
            ),
            path: source,
            step,
        })}`);
    }
    lines.push('        } else {');
    lines.push(`            const ${destinationRead} = $readPath($value, ${destination});`);
    lines.push(`            if (${destinationRead}.status === "failed") {`);
    lines.push(`                $failIssue($WandError, ${destinationRead}.issue, ${step.id}, "copy");`);
    lines.push('            }');
    if (instruction.conflict !== 'overwrite') {
        lines.push(`            if (${destinationRead}.status === "found") {`);
        if (instruction.conflict === 'error') {
            lines.push(`                ${failureCallSource({
                code: 'destination_conflict',
                message: sourceString(
                    'Cannot copy the selected path; its destination already exists.',
                ),
                path: destination,
                step,
            })}`);
        }
        lines.push('            } else {');
    }
    lines.push(`                const ${write} = $commitSet(`);
    lines.push(`                    $value, ${destination}, ${sourceRead}.value, $ownership,`);
    lines.push('                );');
    lines.push(`                if (!${write}.ok) {`);
    lines.push(`                    $failIssue($WandError, ${write}.issue, ${step.id}, "copy");`);
    lines.push('                }');
    if (instruction.conflict !== 'overwrite') {
        lines.push('            }');
    }
    lines.push('        }');
    return lines;
}
