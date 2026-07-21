import { failureCallSource } from '../emitter/failure-call-source.js';
import { sourceString } from '../emitter/source-string.js';
import type { StructuralProgram } from '../structural-program/structural-program.js';
import { emitProjectionAction } from './emit-projection-action.js';
import { emitProjectionBoundary } from './emit-projection-boundary.js';
import { compileProjectionActions } from './projection-action.js';
import { projectRenames } from './projected-rename.js';

/** Emit the proven one-pass rename/copy/omit projection at the mapper boundary. */
export function emitStructuralProjection(program: StructuralProgram): readonly string[] {
    const omittedKeys = new Set(program.omit.keys);
    const entries = projectRenames(program.rename.entries, omittedKeys);
    const actions = compileProjectionActions(entries, omittedKeys);
    const lines = emitProjectionBoundary();

    for (const entry of entries) {
        lines.push(`        let $source${String(entry.index)};`);
        lines.push(`        let $source${String(entry.index)}Present = false;`);
        lines.push(`        let $destination${String(entry.index)}Present = false;`);
    }
    lines.push('        try {');
    lines.push('            for (const $key in input) {');
    lines.push('                const $current = input[$key];');
    lines.push('                switch ($key) {');
    for (const [key, action] of actions) {
        lines.push(...emitProjectionAction(key, action));
    }
    lines.push('                    default:');
    lines.push('                        $defineField($value, $key, $current);');
    lines.push('                }');
    lines.push('            }');
    lines.push('        } catch ($cause) {');
    lines.push(`            ${failureCallSource({
        cause: '$cause',
        code: 'invalid_input',
        message: sourceString('Wandofmagic could not inspect the input record.'),
    })}`);
    lines.push('        }');

    for (const entry of entries) {
        const index = String(entry.index);
        lines.push(`        if ($source${index}Present && $destination${index}Present) {`);
        lines.push(`            ${failureCallSource({
            code: 'destination_conflict',
            message: sourceString(
                `Cannot rename ${entry.source} to ${entry.destination}; the destination already exists.`,
            ),
            path: sourceString(entry.destination),
            step: { id: sourceString(program.rename.id), kind: 'rename' },
        })}`);
        lines.push('        }');
    }
    for (const entry of entries) {
        if (!entry.omitted) {
            const index = String(entry.index);
            lines.push(`        if ($source${index}Present) {`);
            lines.push(`            $value[${sourceString(entry.destination)}] = $source${index};`);
            lines.push('        }');
        }
    }
    return lines;
}
