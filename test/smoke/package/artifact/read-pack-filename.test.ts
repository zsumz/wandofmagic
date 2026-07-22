import { describe, expect, it } from 'vitest';
import {
    readPackFilename,
} from '../../../../smoke/package/artifact/read-pack-filename.mts';

describe('npm pack filename', () => {
    it('reads the single packed artifact filename', () => {
        expect(readPackFilename([{ filename: 'wandofmagic.tgz' }])).toBe('wandofmagic.tgz');
    });

    it.each([
        undefined,
        {},
        [],
        [{ filename: 'first.tgz' }, { filename: 'second.tgz' }],
    ])('rejects invalid result shape %#', (value) => {
        expect(() => readPackFilename(value))
            .toThrow('npm pack returned an invalid result.');
    });

    it.each([
        { value: [null] },
        { value: [{}] },
        { value: [{ filename: 42 }] },
    ])('rejects a missing filename in result %#', ({ value }) => {
        expect(() => readPackFilename(value))
            .toThrow('npm pack did not return a filename.');
    });
});
