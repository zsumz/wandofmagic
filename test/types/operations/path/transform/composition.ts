import { spell } from 'wandofmagic';

import type { Model } from './model.js';

const sequential = spell<{ readonly profile?: { readonly label?: string } }>()
    .set(['profile', 'label'], 'ready' as const)
    .transform(['profile', 'label'], (label) => {
        const precise: 'ready' = label;
        void precise;
        return label.length;
    })
    .build();
const sequentialLabel: number = sequential.run({}).profile.label;
void sequentialLabel;

const repeated = spell<Model>()
    .transform(['profile', 'name'], (name) => name.length)
    .transform(['profile', 'name'], (length) => {
        const precise: number = length;
        void precise;
        return length > 0;
    })
    .build();
const repeatedName: boolean = repeated.run({ stable: true }).profile.name;
void repeatedName;
