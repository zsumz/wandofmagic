import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('deep set receipts', () => {
    it('suppresses Object.is no-ops and excludes replacements from metadata', () => {
        const replacement = Object.freeze({ token: 'private-value' });
        const normalize = spell<{ metadata: typeof replacement }>()
            .set(['metadata'], replacement)
            .build();
        const result = normalize.safeRun({ metadata: replacement });

        expect(result).toMatchObject({ changes: [], ok: true });
        expect(JSON.stringify(normalize.describe())).not.toContain('private-value');
        expect(JSON.stringify(result.changes)).not.toContain('private-value');
    });
});
