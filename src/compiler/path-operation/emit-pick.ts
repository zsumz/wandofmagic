import type { PickInstruction } from '../../instructions/path/path-operation.js';
import type { EmitterState } from '../emitter/emitter-state.js';
import { pathReadersSource, pathsSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitPick(
    instruction: PickInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    const projected = `$projected${String(operationIndex)}`;
    return [
        `        const ${projected} = $projectPaths(`,
        `            $value, ${pathsSource(instruction.paths, state)},`,
        `            ${pathReadersSource(instruction.paths, state)}, $ownership,`,
        '        );',
        `        if (!${projected}.ok) {`,
        `            $failIssue($WandError, ${projected}.issue, ${sourceString(instruction.id)}, "pick");`,
        '        }',
        `        $replaceRecord($value, ${projected}.value);`,
    ];
}
