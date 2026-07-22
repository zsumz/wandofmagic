import type { RenameInstruction } from '../../instructions/flat/flat-operation.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitRename(
    instruction: RenameInstruction,
    operationIndex: number,
): readonly string[] {
    const lines: string[] = [];
    const sources = new Set(instruction.entries.map((entry) => entry.source));
    for (let index = 0; index < instruction.entries.length; index += 1) {
        const entry = instruction.entries[index];
        if (entry === undefined || entry.source === entry.destination) {
            continue;
        }
        const suffix = `${String(operationIndex)}_${String(index)}`;
        const present = `$renamePresent${suffix}`;
        const captured = `$renameValue${suffix}`;
        const source = sourceString(entry.source);
        const destination = sourceString(entry.destination);
        lines.push(`        const ${present} = $hasOwn($value, ${source});`);
        lines.push(`        const ${captured} = ${present} ? $value[${source}] : undefined;`);
        if (!sources.has(entry.destination)) {
            lines.push(`        if (${present} && $hasOwn($value, ${destination})) {`);
            lines.push(`            ${failureCallSource({
                code: 'destination_conflict',
                message: sourceString(
                    `Cannot rename ${entry.source} to ${entry.destination}; the destination already exists.`,
                ),
                path: destination,
                step: { id: sourceString(instruction.id), kind: 'rename' },
            })}`);
            lines.push('        }');
        }
    }
    for (let index = 0; index < instruction.entries.length; index += 1) {
        const entry = instruction.entries[index];
        if (entry !== undefined && entry.source !== entry.destination) {
            const suffix = `${String(operationIndex)}_${String(index)}`;
            lines.push(`        if ($renamePresent${suffix}) {`);
            lines.push(`            delete $value[${sourceString(entry.source)}];`);
            lines.push('        }');
        }
    }
    for (let index = 0; index < instruction.entries.length; index += 1) {
        const entry = instruction.entries[index];
        if (entry !== undefined && entry.source !== entry.destination) {
            const suffix = `${String(operationIndex)}_${String(index)}`;
            lines.push(`        if ($renamePresent${suffix}) {`);
            lines.push(
                `            $defineField($value, ${sourceString(entry.destination)},`
                + ` $renameValue${suffix});`,
            );
            lines.push('        }');
        }
    }
    return lines;
}
