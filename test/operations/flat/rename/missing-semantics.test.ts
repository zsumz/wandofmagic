import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('rename missing-value semantics', () => {
    it('renames present undefined and null fields while skipping absent fields', () => {
        const normalize = spell<{
            absent?: string;
            nullValue: null;
            undefinedValue: string | undefined;
        }>()
            .rename({
                absent: 'renamedAbsent',
                nullValue: 'renamedNull',
                undefinedValue: 'renamedUndefined',
            })
            .build();

        expect(normalize.run({ nullValue: null, undefinedValue: undefined })).toEqual({
            renamedNull: null,
            renamedUndefined: undefined,
        });
    });
});
