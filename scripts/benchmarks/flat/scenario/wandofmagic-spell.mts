import { boolean, number } from '../../../../dist/coerce.js';
import { spell } from '../../../../dist/index.js';
import { deriveDisplayName } from './display-name.mts';

interface FlatSpellInput {
    active?: boolean | string;
    age: number | string;
    email: string;
    first_name: string;
    last_name: string;
    password_hash: string;
}

export const normalize = spell<FlatSpellInput>({ name: 'flat-benchmark', version: 1 })
    .rename({
        first_name: 'firstName',
        last_name: 'lastName',
        password_hash: 'passwordHash',
    })
    .trim(['firstName', 'lastName', 'email'])
    .coerce('age', number({ integer: true }))
    .coerce('active', boolean(), { missing: 'skip' })
    .default('active', false)
    .derive('displayName', ['firstName', 'lastName'], deriveDisplayName)
    .omit(['passwordHash'])
    .build();

export const checkedDiscard = Object.freeze({ receipt: 'discard' as const });
export const trustedDiscard = Object.freeze({
    input: 'trusted' as const,
    receipt: 'discard' as const,
});
