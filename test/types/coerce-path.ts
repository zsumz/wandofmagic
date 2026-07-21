import { type InferOutput, spell, wand } from 'wandofmagic';
import { boolean, number, string } from 'wandofmagic/coerce';

interface Model {
    readonly profile?: {
        readonly count?: number | string;
        readonly rows: Array<{ readonly value?: string }>;
    };
    readonly stable: boolean;
}

const required = spell<Model>()
    .coerce(['profile', 'count'], number())
    .build();
type RequiredOutput = InferOutput<typeof required>;
declare const requiredOutput: RequiredOutput;
const requiredCount: number = requiredOutput.profile.count;
const stable: boolean = requiredOutput.stable;
void [required, requiredCount, stable];

const skipped = spell<Model>()
    .coerce(['profile', 'count'], number(), { missing: 'skip' })
    .build();
type SkippedOutput = InferOutput<typeof skipped>;
declare const skippedOutput: SkippedOutput;
if (skippedOutput.profile?.count !== undefined) {
    const skippedCount: number = skippedOutput.profile.count;
    void skippedCount;
}
void skipped;

const sequential = spell<{ readonly profile?: { readonly count?: string } }>()
    .set(['profile', 'count'], '12' as const)
    .coerce(['profile', 'count'], number())
    .build();
const sequentialCount: number = sequential.run({}).profile.count;
void sequentialCount;

const repeated = spell<Model>()
    .coerce(['profile', 'count'], number())
    .coerce(['profile', 'count'], string())
    .build();
const repeatedCount: string = repeated.run({ stable: true }).profile.count;
void repeatedCount;

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

spell<{ count?: string }>().coerce('count', number(), { missing: 'skip' });

// @ts-expect-error -- the selected path value must be accepted by the coercer.
spell<Model>().coerce(['profile', 'count'], boolean());

// @ts-expect-error -- deep coerce paths must exist in the current type state.
spell<Model>().coerce(['profile', 'missing'], string());

// @ts-expect-error -- dangerous nested path segments are rejected statically.
spell<Model>().coerce(['profile', 'constructor'], string());

// @ts-expect-error -- strict paths stop at eight segments.
spell<Model>().coerce(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], string());
