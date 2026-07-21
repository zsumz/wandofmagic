import { type InferOutput, spell, wand } from 'wandofmagic';
import { number, string } from 'wandofmagic/coerce';

import type { Model } from './model.js';

const rows = spell<Model>()
    .coerce(['profile', 'rows', 0, 'value'], string())
    .build();
type RowsOutput = InferOutput<typeof rows>;
declare const rowsOutput: RowsOutput;
const first = rowsOutput.profile.rows[0];
if (first !== undefined && 'value' in first) {
    const rowValue: string = first.value;
    void rowValue;
}
void rows;

const oneOff = wand({ profile: { count: '3' } })
    .coerce(['profile', 'count'], number())
    .value();
const oneOffCount: number = oneOff.profile.count;
void oneOffCount;
