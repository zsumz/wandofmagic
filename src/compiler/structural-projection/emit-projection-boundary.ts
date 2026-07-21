import { failureCallSource } from '../emitter/failure-call-source.js';
import { sourceString } from '../emitter/source-string.js';

export function emitProjectionBoundary(): string[] {
    const inspectionFailure = failureCallSource({
        cause: '$cause',
        code: 'invalid_input',
        message: sourceString('Wandofmagic could not inspect the input record.'),
    });
    const prototypeFailure = failureCallSource({
        code: 'invalid_input',
        message: [
            'Array.isArray(input)',
            '                ? "The v0 execution core accepts a plain object at the root, not an array."',
            '                : "Wandofmagic accepts plain objects and null-prototype objects at the root."',
        ].join('\n'),
    });
    return [
        '        let $prototype;',
        '        try {',
        '            $prototype = Object.getPrototypeOf(input);',
        '        } catch ($cause) {',
        `            ${inspectionFailure}`,
        '        }',
        '        if ($prototype !== $objectPrototype && $prototype !== null) {',
        `            ${prototypeFailure}`,
        '        }',
        '        const $value = $prototype === null ? Object.create(null) : {};',
    ];
}
