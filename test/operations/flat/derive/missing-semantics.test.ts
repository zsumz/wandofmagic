import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('derive missing-value semantics', () => {
    it('passes null dependencies and rejects undefined dependencies', () => {
        const deriveNull = spell<{ source: null }>()
            .derive('derived', ['source'], ([source]) => String(source))
            .build();
        expect(deriveNull.run({ source: null })).toEqual({ derived: 'null', source: null });

        const deriveUndefined = spell<{ source: string | undefined }>()
            .derive('derived', ['source'], ([source]) => source)
            .build();
        expect(deriveUndefined.safeRun({ source: undefined })).toMatchObject({
            issues: [{ code: 'missing_field' }],
            ok: false,
        });
    });
});
