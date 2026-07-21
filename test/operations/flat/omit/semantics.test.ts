import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('omit semantics', () => {
    it('omits own undefined and null fields', () => {
        const omit = spell<{ nullValue: null; undefinedValue: undefined }>()
            .omit(['nullValue', 'undefinedValue'])
            .build();

        expect(omit.run({ nullValue: null, undefinedValue: undefined })).toEqual({});
    });

    it('treats absent fields as a no-op and deduplicates keys', () => {
        const omit = spell<{ keep: string; missing?: string }>().omit(['missing', 'missing']).build();

        expect(omit.safeRun({ keep: 'yes' })).toMatchObject({ changes: [], ok: true });
        expect(omit.run({ keep: 'yes', missing: 'remove' })).toEqual({ keep: 'yes' });
    });
});
