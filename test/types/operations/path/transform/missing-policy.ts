import { type InferOutput, spell } from 'wandofmagic';

import type { Model } from './model.js';

const skipped = spell<Model>()
    .transform(['profile', 'name'], (name) => name.length, { missing: 'skip' })
    .build();
type SkippedOutput = InferOutput<typeof skipped>;
void skipped;
declare const skippedOutput: SkippedOutput;
const optionalProfile: Model['profile'] | { readonly name?: number; readonly rows: Model['profile'] extends infer Profile
    ? Profile extends { readonly rows: infer Rows } ? Rows : never
    : never } = skippedOutput.profile;
void optionalProfile;

const repeatedSkip = spell<Model>()
    .transform(['profile', 'name'], (name) => name.length, { missing: 'skip' })
    .transform(['profile', 'name'], (length) => length > 0, { missing: 'skip' })
    .build();
type RepeatedSkipOutput = InferOutput<typeof repeatedSkip>;
declare const repeatedSkipOutput: RepeatedSkipOutput;
if (repeatedSkipOutput.profile?.name !== undefined) {
    const skippedName: boolean = repeatedSkipOutput.profile.name;
    void skippedName;
}
void repeatedSkip;
