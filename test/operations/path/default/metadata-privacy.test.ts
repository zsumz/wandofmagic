import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep default metadata privacy', () => {
    it('does not expose fallback values in descriptions or receipts', () => {
        const fallback = Object.freeze({ token: 'private-fallback' });
        const normalize = spell<{ profile?: { metadata?: typeof fallback } }>()
            .default(['profile', 'metadata'], fallback)
            .build();
        const result = normalize.safeRun({});

        expect(result).toMatchObject({ changes: [{ kind: 'default' }], ok: true });
        expect(JSON.stringify(normalize.describe())).not.toContain('private-fallback');
        expect(JSON.stringify(result.changes)).not.toContain('private-fallback');
    });
});
