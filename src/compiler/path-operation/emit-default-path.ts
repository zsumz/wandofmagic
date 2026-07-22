import type { DefaultPathInstruction } from '../../instructions/path/path-operation.js';
import { addBinding, type EmitterState } from '../emitter/emitter-state.js';
import { pathSource, readPathSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitDefaultPath(
    instruction: DefaultPathInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    const binding = addBinding(state, instruction.fallback, 'default', instruction.id);
    const path = pathSource(instruction.path, state);
    const read = `$defaultRead${String(operationIndex)}`;
    const write = `$defaultWrite${String(operationIndex)}`;
    return [
        `        const ${read} = ${readPathSource('$value', instruction.path, state)};`,
        `        if (${read}.status === "failed") {`,
        `            $failIssue($WandError, ${read}.issue, ${sourceString(instruction.id)}, "default");`,
        '        }',
        `        if (${read}.status === "missing" || ${read}.value === undefined) {`,
        `            const ${write} = $commitRead(`,
        `                $value, ${path}, ${read}, ${binding}, $ownership,`,
        '            );',
        `            if (!${write}.ok) {`,
        `                $failIssue($WandError, ${write}.issue, ${sourceString(instruction.id)}, "default");`,
        '            }',
        '        }',
    ];
}
