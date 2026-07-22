import type { PickInstruction } from '../../instructions/path/path-operation.js';
import { pathsSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitPick(instruction: PickInstruction, operationIndex: number): readonly string[] {
    const projected = `$projected${String(operationIndex)}`;
    return [
        `        const ${projected} = $projectPaths(`,
        `            $value, ${pathsSource(instruction.paths)}, $ownership,`,
        '        );',
        `        if (!${projected}.ok) {`,
        `            $failIssue($WandError, ${projected}.issue, ${sourceString(instruction.id)}, "pick");`,
        '        }',
        `        $replaceRecord($value, ${projected}.value);`,
    ];
}
