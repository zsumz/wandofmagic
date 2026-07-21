import { type InferOutput, spell } from 'wandofmagic';

import type { Model } from './model.js';

const required = spell<Model>()
    .transform(['profile', 'name'], (name) => {
        const precise: string = name;
        void precise;
        return name.length;
    })
    .build();
type RequiredOutput = InferOutput<typeof required>;
void required;
declare const requiredOutput: RequiredOutput;
const requiredName: number = requiredOutput.profile.name;
const stable: boolean = requiredOutput.stable;
void [requiredName, stable];

spell<{ value?: string }>().transform('value', (value) => {
    const topLevelValue: string = value;
    void topLevelValue;
    return value.length;
});
