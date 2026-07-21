import type { Spell } from 'wandofmagic';

import type { User, WireUser } from './model.js';
import { normalize } from './program.js';

const spellContract: Spell<WireUser, User> = normalize;
void spellContract;

const missingOptionalInput: User = normalize.run({
    first_name: 'Ada',
    secret: 'hidden',
});
void missingOptionalInput;

const presentOptionalInput: User = normalize.run({
    age: '42',
    first_name: 'Ada',
    secret: 'hidden',
});
void presentOptionalInput;
