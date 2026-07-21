import { type InferOutput, spell } from 'wandofmagic';

import type { Model } from './model.js';

const conditional = spell<Model>()
    .move(['profile', 'optional'], ['profile', 'current'], {
        conflict: 'overwrite',
        missing: 'skip',
    })
    .build();
declare const conditionalValue: InferOutput<typeof conditional>;
void conditional;
const optionalSource: boolean | undefined = conditionalValue.profile.optional;
const optionalDestination: boolean | number | undefined = conditionalValue.profile.current;
void [optionalSource, optionalDestination];

const conditionalNewRoot = spell<Model>()
    .move(['profile', 'optional'], ['result', 'enabled'], { missing: 'skip' })
    .build();
declare const conditionalNewRootValue: InferOutput<typeof conditionalNewRoot>;
const conditionalResult: { enabled?: boolean } | undefined = conditionalNewRootValue.result;
void [conditionalNewRoot, conditionalResult];

const preserved = spell<Model>()
    .move(['profile', 'legacy'], ['profile', 'current'], { conflict: 'preserve' })
    .build();
declare const preservedValue: InferOutput<typeof preserved>;
void preserved;
const maybeLegacy: string | undefined = preservedValue.profile.legacy;
const preservedDestination: string | number | undefined = preservedValue.profile.current;
void [maybeLegacy, preservedDestination];
