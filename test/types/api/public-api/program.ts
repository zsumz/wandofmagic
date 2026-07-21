import { spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';

import type { WireUser } from './model.js';

export const normalize = spell<WireUser>()
    .rename({ first_name: 'firstName' })
    .coerce('age', number(), { missing: 'skip' })
    .default('active', false as const)
    .derive('label', ['firstName'], ([firstName]) => firstName.toUpperCase())
    .omit(['secret'])
    .build();
