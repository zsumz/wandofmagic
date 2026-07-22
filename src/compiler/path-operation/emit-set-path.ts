import type { SetInstruction } from '../../instructions/path/path-operation.js';
import { addBinding, type EmitterState } from '../emitter/emitter-state.js';
import { pathSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitSetPath(
    instruction: SetInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    const binding = addBinding(state, instruction.replacement, 'set', instruction.id);
    const result = `$set${String(operationIndex)}`;
    return [
        `        const ${result} = $commitSet(`,
        `            $value, ${pathSource(instruction.path)}, ${binding}, $ownership,`,
        '        );',
        `        if (!${result}.ok) {`,
        `            $failIssue($WandError, ${result}.issue, ${sourceString(instruction.id)}, "set");`,
        '        }',
    ];
}
