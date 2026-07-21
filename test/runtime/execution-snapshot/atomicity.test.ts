import { describe, expect, it } from 'vitest';
import { spell } from '../../../src/index.js';

describe('execution snapshot atomicity', () => {
    it('does not expose or report partial multi-field writes on failure', () => {
        const normalize = spell<{ first: string; second: string }>()
            .trim(['first', 'second'])
            .build();
        const input = { first: '  would-trim  ', second: 42 } as unknown as {
            first: string;
            second: string;
        };

        const result = normalize.safeRun(input);

        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'unexpected_type', path: ['second'] }],
            ok: false,
        });
        expect(input).toEqual({ first: '  would-trim  ', second: 42 });
    });
});
