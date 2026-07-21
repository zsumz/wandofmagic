import { type Spell, spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';

import type { Input } from './model.js';

const renamed = spell<Input>()
    .rename({ id: 'userId', nickname: 'displayName' })
    .coerce('retries', number({ integer: true }), { missing: 'skip' })
    .default('state', 'active' as const)
    .build();

interface Output {
    displayName?: string;
    retries?: number;
    state: 'active' | 'inactive';
    readonly userId: string;
}

const spellContract: Spell<Input, Output> = renamed;
void spellContract;

const output: Output = renamed.run({ id: 'user-1' });
void output;
