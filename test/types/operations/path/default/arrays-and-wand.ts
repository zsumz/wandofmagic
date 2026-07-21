import { type InferOutput, spell, wand } from 'wandofmagic';

import type { Model } from './model.js';

const rows = spell<Model>()
    .default(['profile', 'rows', 0, 'label'], 'new')
    .build();
type RowsOutput = InferOutput<typeof rows>;
declare const rowsOutput: RowsOutput;
const first = rowsOutput.profile.rows[0];
if (first !== undefined && 'label' in first) {
    const rowLabel: string = first.label;
    void rowLabel;
}
void rows;

const oneOff = wand({ profile: {} })
    .default(['profile', 'name'], 'Ada' as const)
    .value();
const oneOffName: 'Ada' = oneOff.profile.name;
void oneOffName;
