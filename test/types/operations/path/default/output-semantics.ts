import { type InferOutput, spell } from 'wandofmagic';

import type { Model } from './model.js';

const required = spell<Model>()
    .default(['profile', 'name'], 'Ada' as const)
    .build();
type RequiredOutput = InferOutput<typeof required>;
declare const requiredOutput: RequiredOutput;
const requiredName: 'Ada' | 'Grace' = requiredOutput.profile.name;
const stable: boolean = requiredOutput.stable;
void [required, requiredName, stable];

const preservesNull = spell<{ readonly profile?: { readonly value?: string | null } }>()
    .default(['profile', 'value'], 'fallback')
    .build();
const nullableValue: string | null = preservesNull.run({}).profile.value;
void nullableValue;

const createsPath = spell<{ readonly stable: boolean }>()
    .default(['metadata', 'source'], 'api' as const)
    .build();
const createdSource: 'api' = createsPath.run({ stable: true }).metadata.source;
void createdSource;

spell<{ state?: 'active' | 'inactive' }>().default('state', 'active' as const);
