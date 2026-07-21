import { type InferOutput, spell, wand } from 'wandofmagic';

import type { Model } from './model.js';

const rows = spell<Model>()
    .omit([['profile', 'rows', 0, 'label']])
    .build();
type RowsOutput = InferOutput<typeof rows>;
declare const rowsOutput: RowsOutput;
const first = rowsOutput.profile?.rows[0];
if (first !== undefined && 'label' in first) {
    const retainedLabel: string = first.label;
    void retainedLabel;
}
void rows;

const oneOff = wand({ profile: { keep: true, secret: 'private' } })
    .omit([['profile', 'secret']])
    .value();
const oneOffKeep: boolean = oneOff.profile.keep;
// @ts-expect-error -- wand uses the same deep omit program.
void oneOff.profile.secret;
void oneOffKeep;
