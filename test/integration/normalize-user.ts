import { boolean, isoDate, number } from '../../src/coerce/index.js';
import { spell } from '../../src/index.js';

export interface WireUser {
    active?: 'false' | 'true';
    age?: string;
    created_at: string;
    email: string;
    first_name: string;
    last_name?: string | null;
    password_hash: string;
}

export const normalizeUser = spell<WireUser>({ name: 'normalize-user', version: 1 })
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
