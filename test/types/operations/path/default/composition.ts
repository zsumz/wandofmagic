import { spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';

import type { Model } from './model.js';

const sequential = spell<{ readonly profile?: { readonly count?: string } }>()
    .set(['profile', 'count'], undefined)
    .default(['profile', 'count'], '12')
    .coerce(['profile', 'count'], number())
    .build();
const sequentialCount: number = sequential.run({}).profile.count;
void sequentialCount;

const repeated = spell<Model>()
    .default(['profile', 'name'], 'Ada' as const)
    .default(['profile', 'name'], 'Grace' as const)
    .build();
const repeatedName: 'Ada' | 'Grace' = repeated.run({ stable: true }).profile.name;
void repeatedName;
