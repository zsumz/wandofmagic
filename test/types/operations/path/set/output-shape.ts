import { type InferOutput, spell } from 'wandofmagic';

import type { Model } from './model.js';

const normalize = spell<Model>()
    .set(['profile', 'name'], 'Grace' as const)
    .set(['profile', 'rows', 0, 'selected'], true as const)
    .set(['metadata', 'source'], 'api' as const)
    .set('active', false as const)
    .build();

type Output = InferOutput<typeof normalize>;
declare const input: Model;
const output: Output = normalize.run(input);
const requiredName: 'Grace' = output.profile.name;
const firstRow = output.profile.rows[0];
if (firstRow !== undefined && 'selected' in firstRow) {
    const selected: true = firstRow.selected;
    void selected;
}
void requiredName;

interface Expected {
    readonly active: false;
    readonly metadata: { source: 'api' };
    readonly profile:
        | { name: 'Grace'; rows: Array<{ selected: true }> }
        | {
            readonly name: 'Grace';
            readonly rows: Array<
                { readonly label: string }
                | { readonly label: string; selected: true }
            >;
        };
    readonly stable: boolean;
}

declare const expected: Expected;
const outputMatchesExpected: Expected = output;
const expectedMatchesOutput: Output = expected;
void [outputMatchesExpected, expectedMatchesOutput];
