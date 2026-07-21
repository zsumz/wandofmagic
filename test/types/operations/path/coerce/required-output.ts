import { type InferOutput, spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';

import type { Model } from './model.js';

const required = spell<Model>()
    .coerce(['profile', 'count'], number())
    .build();
type RequiredOutput = InferOutput<typeof required>;
declare const requiredOutput: RequiredOutput;
const requiredCount: number = requiredOutput.profile.count;
const stable: boolean = requiredOutput.stable;
void [required, requiredCount, stable];
