import { type InferOutput, spell, wand } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';

interface Model {
    readonly profile?: {
        readonly count?: string;
        readonly name?: 'Ada' | 'Grace' | undefined;
        readonly rows: Array<{ readonly label?: string }>;
    };
    readonly stable: boolean;
}

const required = spell<Model>()
    .default(['profile', 'name'], 'Ada' as const)
    .build();
type RequiredOutput = InferOutput<typeof required>;
declare const requiredOutput: RequiredOutput;
const requiredName: 'Ada' | 'Grace' = requiredOutput.profile.name;
const stable: boolean = requiredOutput.stable;
void [required, requiredName, stable];

const preservesNull = spell<{ readonly profile?: { readonly value?: string | null } }>()
    .default(['profile', 'value'], 'fallback')
    .build();
const nullableValue: string | null = preservesNull.run({}).profile.value;
void nullableValue;

const createsPath = spell<{ readonly stable: boolean }>()
    .default(['metadata', 'source'], 'api' as const)
    .build();
const createdSource: 'api' = createsPath.run({ stable: true }).metadata.source;
void createdSource;

const sequential = spell<{ readonly profile?: { readonly count?: string } }>()
    .set(['profile', 'count'], undefined)
    .default(['profile', 'count'], '12')
    .coerce(['profile', 'count'], number())
    .build();
const sequentialCount: number = sequential.run({}).profile.count;
void sequentialCount;

const repeated = spell<Model>()
    .default(['profile', 'name'], 'Ada' as const)
    .default(['profile', 'name'], 'Grace' as const)
    .build();
const repeatedName: 'Ada' | 'Grace' = repeated.run({ stable: true }).profile.name;
void repeatedName;

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

spell<{ state?: 'active' | 'inactive' }>().default('state', 'active' as const);

// @ts-expect-error -- a fallback cannot widen an existing defined path value.
spell<Model>().default(['profile', 'name'], 'Unknown');

// @ts-expect-error -- dangerous nested path segments are rejected statically.
spell<Model>().default(['profile', 'constructor'], 'value');

// @ts-expect-error -- strict paths stop at eight segments.
spell<Model>().default(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], 'value');
