import { type InferOutput, spell } from 'wandofmagic';

import type { Model } from './model.js';

const mixed = spell<Model>()
    .omit([['topSecret'], ['profile', 'nested', 'token']])
    .build();
type MixedOutput = InferOutput<typeof mixed>;
declare const mixedOutput: MixedOutput;
// @ts-expect-error -- mixed selectors remove top-level strings too.
void mixedOutput.topSecret;
if (mixedOutput.profile !== undefined) {
    const nestedKeep: boolean = mixedOutput.profile.nested.keep;
    void nestedKeep;
    // @ts-expect-error -- the selected deep field is removed.
    void mixedOutput.profile.nested.token;
}
void mixed;

const flat = spell<Model>().omit(['topSecret']).build();
type FlatOutput = InferOutput<typeof flat>;
declare const flatOutput: FlatOutput;
// @ts-expect-error -- existing flat batches retain their strict output behavior.
void flatOutput.topSecret;
void flat;
