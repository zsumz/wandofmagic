import { spell } from 'wandofmagic';
import { number, string } from 'wandofmagic/coerce';

import type { Model } from './model.js';

const sequential = spell<{ readonly profile?: { readonly count?: string } }>()
    .set(['profile', 'count'], '12' as const)
    .coerce(['profile', 'count'], number())
    .build();
const sequentialCount: number = sequential.run({}).profile.count;
void sequentialCount;

const repeated = spell<Model>()
    .coerce(['profile', 'count'], number())
    .coerce(['profile', 'count'], string())
    .build();
const repeatedCount: string = repeated.run({ stable: true }).profile.count;
void repeatedCount;
