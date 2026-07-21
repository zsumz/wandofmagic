import { describe, expect, it } from 'vitest';
import { normalizeUser, type WireUser } from './normalize-user.js';

describe('user normalization vertical slice', () => {
    it('turns a messy object into typed application data with a receipt', () => {
        const input: WireUser = {
            age: '42',
            created_at: '2026-07-20T12:30:00Z',
            email: '  ada@example.com ',
            first_name: ' Ada ',
            last_name: ' Lovelace ',
            password_hash: 'secret',
        };

        const result = normalizeUser.safeRun(input);

        expect(result.ok).toBe(true);
        if (!result.ok) {
            throw new Error('Expected normalization to succeed.');
        }

        expect(result.value).toEqual({
            active: false,
            age: 42,
            createdAt: new Date('2026-07-20T12:30:00Z'),
            displayName: 'Ada Lovelace',
            email: 'ada@example.com',
            firstName: 'Ada',
            lastName: 'Lovelace',
        });
        expect(input).toEqual({
            age: '42',
            created_at: '2026-07-20T12:30:00Z',
            email: '  ada@example.com ',
            first_name: ' Ada ',
            last_name: ' Lovelace ',
            password_hash: 'secret',
        });

        expect(result.changes.map((change) => change.kind)).toEqual([
            'rename',
            'rename',
            'rename',
            'rename',
            'trim',
            'trim',
            'trim',
            'coerce',
            'coerce',
            'default',
            'derive',
            'omit',
        ]);
        expect(JSON.stringify(result.changes)).not.toContain('ada@example.com');
        expect(JSON.stringify(result.changes)).not.toContain('secret');
        expect(Object.isFrozen(result)).toBe(true);
        expect(Object.isFrozen(result.changes)).toBe(true);
        expect(result.changes.every(Object.isFrozen)).toBe(true);
    });
});
