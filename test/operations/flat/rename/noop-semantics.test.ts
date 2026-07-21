import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('rename no-op semantics', () => {
    it('does not record changes for identity or absent renames', () => {
        const identity = spell<{ value?: string }>().rename({ value: 'value' }).build();

        expect(identity.safeRun({ value: 'same' })).toMatchObject({ changes: [], ok: true });
        expect(identity.safeRun({})).toMatchObject({ changes: [], ok: true });
    });
});
