import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep copy policies', () => {
    it('distinguishes missing sources from occupied destinations', () => {
        const required = spell<{ source?: string; target?: string }>()
            .copy('source', 'target')
            .build();

        expect(required.safeRun({})).toMatchObject({
            issues: [{ code: 'missing_field', path: ['source'], step: { kind: 'copy' } }],
            ok: false,
        });
        expect(required.safeRun({ source: 'value', target: 'occupied' })).toMatchObject({
            issues: [{ code: 'destination_conflict', path: ['target'] }],
            ok: false,
        });
    });

    it('applies skip, overwrite, and preserve policies', () => {
        expect(spell<{ source?: string }>()
            .copy('source', 'target', { missing: 'skip' })
            .build().run({})).toEqual({});

        expect(spell<{ source: string; target: number }>()
            .copy('source', 'target', { conflict: 'overwrite' })
            .build().run({ source: 'copied', target: 7 }))
            .toEqual({ source: 'copied', target: 'copied' });

        expect(spell<{ source: string; target: number }>()
            .copy('source', 'target', { conflict: 'preserve' })
            .build().safeRun({ source: 'kept', target: 7 }))
            .toMatchObject({ changes: [], ok: true, value: { source: 'kept', target: 7 } });
    });
});
