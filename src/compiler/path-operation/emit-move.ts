import type { MoveInstruction } from '../../instructions/path/path-operation.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { pathSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitMove(instruction: MoveInstruction, operationIndex: number): readonly string[] {
    const suffix = String(operationIndex);
    const source = pathSource(instruction.source);
    const destination = pathSource(instruction.destination);
    const sourceRead = `$moveSource${suffix}`;
    const destinationRead = `$moveDestination${suffix}`;
    const written = `$moveWritten${suffix}`;
    const deleted = `$moveDeleted${suffix}`;
    const step = { id: sourceString(instruction.id), kind: 'move' as const };
    const lines = [
        `        const ${sourceRead} = $readPath($value, ${source});`,
        `        if (${sourceRead}.status === "failed") {`,
        `            $failIssue($WandError, ${sourceRead}.issue, ${step.id}, "move");`,
        '        }',
        `        if (${sourceRead}.status === "missing" || ${sourceRead}.value === undefined) {`,
    ];
    if (instruction.missing === 'error') {
        lines.push(`            ${failureCallSource({
            code: 'missing_field',
            message: sourceString(
                'Cannot move the selected path; its source is missing or undefined.',
            ),
            path: source,
            step,
        })}`);
    }
    lines.push('        } else {');
    lines.push(`            const ${destinationRead} = $readPath($value, ${destination});`);
    lines.push(`            if (${destinationRead}.status === "failed") {`);
    lines.push(`                $failIssue($WandError, ${destinationRead}.issue, ${step.id}, "move");`);
    lines.push('            }');
    if (instruction.conflict !== 'overwrite') {
        lines.push(`            if (${destinationRead}.status === "found") {`);
        if (instruction.conflict === 'error') {
            lines.push(`                ${failureCallSource({
                code: 'destination_conflict',
                message: sourceString(
                    'Cannot move the selected path; its destination already exists.',
                ),
                path: destination,
                step,
            })}`);
        }
        lines.push('            } else {');
    }
    lines.push(`                const ${written} = $setPath(`);
    lines.push(`                    $value, ${destination}, ${sourceRead}.value, $ownership,`);
    lines.push('                );');
    lines.push(`                if (!${written}.ok) {`);
    lines.push(`                    $failIssue($WandError, ${written}.issue, ${step.id}, "move");`);
    lines.push('                }');
    lines.push(
        `                const ${deleted} = $deletePath(`
        + `${written}.value, ${source}, $ownership);`,
    );
    lines.push(`                if (!${deleted}.ok) {`);
    lines.push(`                    $failIssue($WandError, ${deleted}.issue, ${step.id}, "move");`);
    lines.push('                }');
    lines.push(`                $commitRoots($value, ${deleted}.value, [${source}, ${destination}]);`);
    if (instruction.conflict !== 'overwrite') {
        lines.push('            }');
    }
    lines.push('        }');
    return lines;
}
