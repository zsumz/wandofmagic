import { describe, expect, it } from 'vitest';

import { spell } from '../../src/index.js';

describe('ahead-of-time structural projection ordering', () => {
    it('preserves output and receipt order while removing dead structural writes', () => {
        const normalize = spell<{
            first_name: string;
            password_hash: string;
            untouched: number;
        }>()
            .rename({ first_name: 'firstName', password_hash: 'passwordHash' })
            .trim(['firstName'])
            .omit(['passwordHash'])
            .build();

        const result = normalize.safeRun({
            first_name: ' Ada ',
            password_hash: 'secret',
            untouched: 1,
        });
        expect(result).toMatchObject({
            changes: [
                { kind: 'rename', to: ['firstName'] },
                { kind: 'rename', to: ['passwordHash'] },
                { kind: 'trim', path: ['firstName'] },
                { kind: 'omit', path: ['passwordHash'] },
            ],
            ok: true,
            value: { firstName: 'Ada', untouched: 1 },
        });
        if (result.ok) {
            expect(Object.keys(result.value)).toEqual(['untouched', 'firstName']);
        }
    });
});
