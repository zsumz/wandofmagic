import type { TrimInstruction } from '../../instructions/flat/flat-operation.js';
import { failureCallSource } from '../emitter/failure-call-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitTrim(instruction: TrimInstruction, operationIndex: number): string[] {
    const lines: string[] = [];
    for (let index = 0; index < instruction.keys.length; index += 1) {
        const key = instruction.keys[index];
        if (key === undefined) {
            continue;
        }
        const variable = `$current${String(operationIndex)}_${String(index)}`;
        const keySource = sourceString(key);
        lines.push(
            `        const ${variable} = $hasOwn($value, ${keySource})`
            + ` ? $value[${keySource}] : undefined;`,
        );
        lines.push(
            `        if (${variable} !== null && ${variable} !== undefined`
            + ` && typeof ${variable} !== "string") {`,
        );
        lines.push(`            ${failureCallSource({
            code: 'unexpected_type',
            message: sourceString(`Cannot trim ${key}; expected a string, null, or undefined.`),
            path: keySource,
            step: { id: sourceString(instruction.id), kind: 'trim' },
        })}`);
        lines.push('        }');
    }
    for (let index = 0; index < instruction.keys.length; index += 1) {
        const key = instruction.keys[index];
        if (key === undefined) {
            continue;
        }
        const variable = `$current${String(operationIndex)}_${String(index)}`;
        const trimmed = `$trimmed${String(operationIndex)}_${String(index)}`;
        lines.push(`        if (typeof ${variable} === "string") {`);
        lines.push(`            const ${trimmed} = ${variable}.trim();`);
        lines.push(`            if (${trimmed} !== ${variable}) {`);
        lines.push(`                $value[${sourceString(key)}] = ${trimmed};`);
        lines.push('            }');
        lines.push('        }');
    }
    return lines;
}
