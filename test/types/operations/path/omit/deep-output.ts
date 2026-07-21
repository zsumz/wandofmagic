import { type InferOutput, spell } from 'wandofmagic';

import type { Model } from './model.js';

const deep = spell<Model>()
    .omit([['profile', 'secret']])
    .build();
type DeepOutput = InferOutput<typeof deep>;
declare const deepOutput: DeepOutput;
if (deepOutput.profile !== undefined) {
    const keep: boolean = deepOutput.profile.keep;
    void keep;
    // @ts-expect-error -- the selected nested field is absent from successful output.
    void deepOutput.profile.secret;
}
void deep;
