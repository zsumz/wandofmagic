import { describe, expect, it } from 'vitest';

import { failureCallSource } from '../../../src/compiler/emitter/failure-call-source.js';
import { sourceString } from '../../../src/compiler/emitter/source-string.js';

describe('generated failure call source', () => {
    it('emits the required runtime arguments without optional values', () => {
        expect(failureCallSource({
            code: 'invalid_input',
            message: sourceString('Input is invalid.'),
        })).toBe('$fail($WandError, "invalid_input", "Input is invalid.");');
    });

    it('omits unused trailing runtime arguments', () => {
        expect(failureCallSource({
            code: 'missing_field',
            message: sourceString('Required field is missing.'),
            path: sourceString('name'),
            step: { id: sourceString('trim:1'), kind: 'trim' },
        })).toBe(
            '$fail($WandError, "missing_field", "Required field is missing.", "name", "trim:1", "trim");',
        );
    });

    it('fills positional gaps before a cause', () => {
        expect(failureCallSource({
            cause: '$cause',
            code: 'invalid_input',
            message: sourceString('Input could not be inspected.'),
        })).toBe(
            '$fail($WandError, "invalid_input", "Input could not be inspected.",'
            + ' undefined, undefined, undefined, undefined, $cause);',
        );
    });

    it('preserves generated detail expressions', () => {
        expect(failureCallSource({
            code: 'coercion_failed',
            details: '$details2',
            message: '$converted2.message',
            path: sourceString('age'),
            step: { id: sourceString('coerce:2'), kind: 'coerce' },
        })).toBe(
            '$fail($WandError, "coercion_failed", $converted2.message, "age",'
            + ' "coerce:2", "coerce", $details2);',
        );
    });
});
