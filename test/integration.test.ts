import { describe, expect, it } from 'vitest';
import { spell, wand } from '../src/index.js';
import { boolean, isoDate, number } from '../src/coerce/index.js';

interface WireUser {
    active?: 'false' | 'true';
    age?: string;
    created_at: string;
    email: string;
    first_name: string;
    last_name?: string | null;
    password_hash: string;
}

const normalizeUser = spell<WireUser>({ name: 'normalize-user', version: 1 })
    .rename({
        created_at: 'createdAt',
        first_name: 'firstName',
        last_name: 'lastName',
        password_hash: 'passwordHash',
    })
    .trim(['firstName', 'lastName', 'email'], { id: 'normalize-strings' })
    .coerce('age', number({ integer: true }), { missing: 'skip' })
    .coerce('active', boolean(), { missing: 'skip' })
    .coerce('createdAt', isoDate())
    .default('active', false as const)
    .derive(
        'displayName',
        ['firstName', 'lastName'],
        ([firstName, lastName]) => [firstName, lastName].filter(Boolean).join(' '),
        { id: 'derive-display-name' },
    )
    .omit(['passwordHash'])
    .build();

describe('Wandofmagic vertical slice', () => {
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

    it('supports a compact one-off wand', () => {
        const output = wand({ count: '7', label: '  widgets  ' })
            .trim(['label'])
            .coerce('count', number({ integer: true }))
            .value();

        expect(output).toEqual({ count: 7, label: 'widgets' });
    });

    it('describes a plan without inspecting data', () => {
        expect(normalizeUser.describe()).toMatchObject({
            name: 'normalize-user',
            version: 1,
        });
        expect(Object.isFrozen(normalizeUser.describe())).toBe(true);
        expect(Object.isFrozen(normalizeUser.describe().steps)).toBe(true);
        expect(Object.isFrozen(normalizeUser.describe().steps[0]?.reads)).toBe(true);
        expect(normalizeUser.describe().steps.at(-2)).toEqual({
            id: 'derive-display-name',
            kind: 'derive',
            reads: [['firstName'], ['lastName']],
            removes: [],
            writes: [['displayName']],
        });
    });
});
