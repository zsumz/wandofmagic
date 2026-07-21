import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

interface Input {
    profile?: { secret?: string | undefined } | null;
}

describe('deep omit missing-value semantics', () => {
    it('tolerates missing and null parents but removes present undefined fields', () => {
        const sanitize = spell<Input>().omit([['profile', 'secret']]).build();

        expect(sanitize.safeRun({})).toMatchObject({ changes: [], ok: true, value: {} });
        expect(sanitize.safeRun({ profile: null }))
            .toMatchObject({ changes: [], ok: true, value: { profile: null } });
        const present = sanitize.safeRun({ profile: { secret: undefined } });
        expect(present).toMatchObject({
            changes: [{ kind: 'omit', path: ['profile', 'secret'] }],
            ok: true,
            value: { profile: {} },
        });
    });
});
