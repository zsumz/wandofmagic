import type { CoercePathInstruction } from '../../instructions/path/path-operation.js';
import type { EmitterState } from '../emitter/emitter-state.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { pathSource } from '../emitter/path-source.js';
import { sourceString } from '../emitter/source-string.js';
import type { PathCoercionContext } from './path-coercion/emission-context.js';
import { emitPresentPathCoercion } from './path-coercion/emit-present-path-coercion.js';

export function emitCoercePath(
    instruction: CoercePathInstruction,
    operationIndex: number,
    state: EmitterState,
): readonly string[] {
    const suffix = String(operationIndex);
    const path = pathSource(instruction.path, state);
    const read = `$coercePathRead${suffix}`;
    const current = `$current${suffix}`;
    const context: PathCoercionContext = { current, instruction, operationIndex, path };
    const lines = [
        `        const ${read} = $readPath($value, ${path});`,
        `        if (${read}.status === "failed") {`,
        `            $failIssue($WandError, ${read}.issue, ${sourceString(instruction.id)}, "coerce");`,
        '        }',
        `        const ${current} = ${read}.status === "found" ? ${read}.value : undefined;`,
    ];
    if (instruction.missing === 'error') {
        lines.push(`        if (${current} === undefined) {`);
        lines.push(`            ${failureCallSource({
            code: 'missing_field',
            message: sourceString(
                'Cannot coerce the selected path; it is missing or undefined.',
            ),
            path,
            step: { id: sourceString(instruction.id), kind: 'coerce' },
        })}`);
        lines.push('        }');
        lines.push(...emitPresentPathCoercion(context, state));
    } else {
        lines.push(`        if (${current} !== undefined) {`);
        lines.push(...emitPresentPathCoercion(context, state).map((line) => `    ${line}`));
        lines.push('        }');
    }
    return lines;
}
