import { sourceString } from '../emitter/source-string.js';

export function emitConvertedAssignment(
    key: string,
    current: string,
    converted: string,
): string[] {
    return [
        `        if (!Object.is(${current}, ${converted})) {`,
        `            $value[${sourceString(key)}] = ${converted};`,
        '        }',
    ];
}
