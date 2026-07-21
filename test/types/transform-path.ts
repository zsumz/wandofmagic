import { type InferOutput, spell, wand } from 'wandofmagic';

interface Model {
    readonly profile?: {
        readonly name?: string;
        readonly rows: Array<{ readonly score?: number }>;
    };
    readonly stable: boolean;
}

const required = spell<Model>()
    .transform(['profile', 'name'], (name) => {
        const precise: string = name;
        void precise;
        return name.length;
    })
    .build();
type RequiredOutput = InferOutput<typeof required>;
void required;
declare const requiredOutput: RequiredOutput;
const requiredName: number = requiredOutput.profile.name;
const stable: boolean = requiredOutput.stable;
void [requiredName, stable];

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

const sequential = spell<{ readonly profile?: { readonly label?: string } }>()
    .set(['profile', 'label'], 'ready' as const)
    .transform(['profile', 'label'], (label) => {
        const precise: 'ready' = label;
        void precise;
        return label.length;
    })
    .build();
const sequentialLabel: number = sequential.run({}).profile.label;
void sequentialLabel;

const repeated = spell<Model>()
    .transform(['profile', 'name'], (name) => name.length)
    .transform(['profile', 'name'], (length) => {
        const precise: number = length;
        void precise;
        return length > 0;
    })
    .build();
const repeatedName: boolean = repeated.run({ stable: true }).profile.name;
void repeatedName;

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

spell<{ value?: string }>().transform('value', (value) => {
    const topLevelValue: string = value;
    void topLevelValue;
    return value.length;
});

// @ts-expect-error -- deep transform paths must exist in the current type state.
spell<Model>().transform(['profile', 'missing'], String);

// @ts-expect-error -- dangerous nested path segments are rejected statically.
spell<Model>().transform(['profile', 'constructor'], String);

// @ts-expect-error -- strict paths stop at eight segments.
spell<Model>().transform(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], String);

// @ts-expect-error -- the core is synchronous and deep transform callbacks cannot return promises.
spell<Model>().transform(['profile', 'name'], async (name) => {
    await Promise.resolve();
    return name.length;
});
