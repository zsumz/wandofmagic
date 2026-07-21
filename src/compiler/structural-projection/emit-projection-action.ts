import { sourceString } from '../emitter/source-string.js';
import type { ProjectionAction } from './projection-action.js';

export function emitProjectionAction(key: string, action: ProjectionAction): string[] {
    const lines = [`                    case ${sourceString(key)}:`];
    if (action.sourceIndex >= 0) {
        const index = String(action.sourceIndex);
        lines.push(`                        $source${index}Present = true;`);
        lines.push(`                        $source${index} = $current;`);
    } else if (action.destinationIndex >= 0) {
        lines.push(`                        $destination${String(action.destinationIndex)}Present = true;`);
        if (!action.omitted) {
            lines.push('                        $defineField($value, $key, $current);');
        }
    }
    lines.push('                        break;');
    return lines;
}
