import { type InferOutput, spell, wand } from 'wandofmagic';

import type { Model } from './model.js';

const rows = spell<Model>()
    .transform(['profile', 'rows', 0, 'score'], (score) => String(score))
    .build();
type RowsOutput = InferOutput<typeof rows>;
void rows;
declare const rowsOutput: RowsOutput;
const first = rowsOutput.profile.rows[0];
if (first !== undefined && 'score' in first) {
    const transformedScore: number | string = first.score;
    void transformedScore;
}

const oneOff = wand({ profile: { value: 3 } })
    .transform(['profile', 'value'], (value) => String(value))
    .value();
const oneOffValue: string = oneOff.profile.value;
void oneOffValue;
