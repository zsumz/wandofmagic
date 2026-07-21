import { describe, expect, it } from 'vitest';
import {
    readPositiveInteger,
} from '../../../scripts/shared/read-positive-integer.mts';

describe('positive integer environment values', () => {
    it('returns the fallback when the variable is absent', () => {
        expect(readPositiveInteger('COUNT', 7, {})).toBe(7);
    });

    it('parses a positive safe integer', () => {
        expect(readPositiveInteger('COUNT', 7, { COUNT: '42' })).toBe(42);
    });

    it.each(['0', '-1', '1.5', 'NaN', '9007199254740992'])(
        'rejects %s',
        (value) => {
            expect(() => readPositiveInteger('COUNT', 7, { COUNT: value }))
                .toThrow('COUNT must be a positive integer.');
        },
    );
});
