import { boolean, number } from '../../../../dist/coerce.js';
import { spell } from '../../../../dist/index.js';
import type { DeepBenchmarkInput } from './model.mts';

export const deepSpell = spell<DeepBenchmarkInput>({ name: 'deep-benchmark', version: 1 })
    .trim([
        ['profile', 'first'],
        ['profile', 'last'],
        ['profile', 'contact', 'legacyEmail'],
    ])
    .coerce(['profile', 'age'], number({ integer: true }))
    .coerce(['profile', 'active'], boolean())
    .default(['metadata', 'source'], 'wire')
    .transform(
        ['profile', 'contact', 'legacyEmail'],
        (email) => email.toLowerCase(),
    )
    .copy(['profile', 'first'], ['metadata', 'owner'])
    .move(['profile', 'contact', 'legacyEmail'], ['profile', 'contact', 'email'])
    .derive(
        ['summary', 'displayName'],
        [['profile', 'first'], ['profile', 'last']],
        ([first, last]) => `${first} ${last}`,
    )
    .omit([['profile', 'secret'], ['metadata', 'source']])
    .pick([
        ['profile', 'first'],
        ['profile', 'last'],
        ['profile', 'age'],
        ['profile', 'active'],
        ['profile', 'contact', 'email'],
        ['metadata', 'owner'],
        ['summary', 'displayName'],
    ])
    .build();

export const checkedDiscard = Object.freeze({ receipt: 'discard' as const });
export const trustedDiscard = Object.freeze({
    input: 'trusted' as const,
    receipt: 'discard' as const,
});
