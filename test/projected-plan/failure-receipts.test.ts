import { describe, expect, it } from 'vitest';

import { number } from '../../src/coerce/index.js';
import { spell } from '../../src/index.js';

describe('ahead-of-time structural projection failure receipts', () => {
    it('keeps rename receipts but defers omit receipts across a middle failure', () => {
        const normalize = spell<{ count: string; secret: string }>()
            .rename({ secret: 'credential' })
            .coerce('count', number())
            .omit(['credential'])
            .build();

        expect(normalize.safeRun({ count: 'invalid', secret: 'private' })).toMatchObject({
            changes: [{ kind: 'rename', to: ['credential'] }],
            issues: [{ code: 'coercion_failed', path: ['count'] }],
            ok: false,
        });
    });
});
