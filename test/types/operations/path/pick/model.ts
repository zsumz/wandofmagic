import {
    type InferOutput,
    type PickAtPaths,
    spell,
    wand,
} from 'wandofmagic';

interface Model {
    readonly id: string;
    readonly profile?: {
        readonly age: number;
        readonly name: string;
        readonly secret: string;
    };
    readonly rows: Array<{ id: string; private: string }>;
    readonly secret: string;
}

const selected = spell<Model>()
    .pick(['id', ['profile', 'name'], ['profile', 'age']])
    .build();
declare const selectedValue: InferOutput<typeof selected>;
const id: string = selectedValue.id;
const profile: { readonly age: number; readonly name: string } | undefined =
    selectedValue.profile;
void [selected, id, profile];

const rows = wand({ rows: [{ id: '1', private: 'remove' }], secret: 'remove' })
    .pick([['rows', 0, 'id']])
    .value();
const firstRow = rows.rows[0];
if (firstRow === undefined) {
    throw new Error('Expected the selected row.');
}
const rowId: string = firstRow.id;
// @ts-expect-error -- unselected array item fields are absent.
void firstRow.private;
void rowId;

type Utility = PickAtPaths<Model, readonly [readonly ['id'], readonly ['rows', 0, 'id']]>;
declare const utility: Utility;
const utilityId: string = utility.id;
const utilityRow = utility.rows[0];
if (utilityRow === undefined) {
    throw new Error('Expected the selected utility row.');
}
const utilityRowId: string = utilityRow.id;
void [utilityId, utilityRowId];
