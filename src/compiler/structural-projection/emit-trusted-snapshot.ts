import { failureCallSource } from '../emitter/failure-call-source.js';
import { sourceString } from '../emitter/source-string.js';
import { emitProjectionBoundary } from './emit-projection-boundary.js';

/** Emit the general trusted root snapshot used when no fused projection is proven. */
export function emitTrustedSnapshot(): readonly string[] {
    const lines = emitProjectionBoundary();
    lines.push('        try {');
    lines.push('            for (const $key in input) {');
    lines.push('                $defineField($value, $key, input[$key]);');
    lines.push('            }');
    lines.push('        } catch ($cause) {');
    lines.push(`            ${failureCallSource({
        cause: '$cause',
        code: 'invalid_input',
        message: sourceString('Wandofmagic could not inspect the input record.'),
    })}`);
    lines.push('        }');
    return lines;
}
