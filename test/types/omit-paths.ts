import { type InferOutput, spell, wand } from 'wandofmagic';

interface Model {
    readonly profile?: {
        readonly keep: boolean;
        readonly nested: { readonly keep: boolean; readonly token: string };
        readonly rows: Array<{ readonly keep: boolean; readonly label: string }>;
        readonly secret: string;
    };
    readonly stable: boolean;
    readonly topSecret: string;
}

const deep = spell<Model>()
    .omit([['profile', 'secret']])
    .build();
type DeepOutput = InferOutput<typeof deep>;
declare const deepOutput: DeepOutput;
if (deepOutput.profile !== undefined) {
    const keep: boolean = deepOutput.profile.keep;
    void keep;
    // @ts-expect-error -- the selected nested field is absent from successful output.
    void deepOutput.profile.secret;
}
void deep;

const mixed = spell<Model>()
    .omit([['topSecret'], ['profile', 'nested', 'token']])
    .build();
type MixedOutput = InferOutput<typeof mixed>;
declare const mixedOutput: MixedOutput;
// @ts-expect-error -- mixed selectors remove top-level strings too.
void mixedOutput.topSecret;
if (mixedOutput.profile !== undefined) {
    const nestedKeep: boolean = mixedOutput.profile.nested.keep;
    void nestedKeep;
    // @ts-expect-error -- the selected deep field is removed.
    void mixedOutput.profile.nested.token;
}
void mixed;

const sequential = spell<Model>()
    .set(['profile', 'created'], true as const)
    .omit([['profile', 'created']])
    .build();
const sequentialProfile = sequential.run({ stable: true, topSecret: 'private' }).profile;
// @ts-expect-error -- omit observes fields added by pending path operations.
void sequentialProfile.created;

const restored = spell<Model>()
    .omit([['profile', 'secret']])
    .set(['profile', 'secret'], 'restored' as const)
    .build();
const restoredSecret: 'restored' = restored.run({
    stable: true,
    topSecret: 'private',
}).profile.secret;
void restoredSecret;

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

const flat = spell<Model>().omit(['topSecret']).build();
type FlatOutput = InferOutput<typeof flat>;
declare const flatOutput: FlatOutput;
// @ts-expect-error -- existing flat batches retain their strict output behavior.
void flatOutput.topSecret;
void flat;

const oneOff = wand({ profile: { keep: true, secret: 'private' } })
    .omit([['profile', 'secret']])
    .value();
const oneOffKeep: boolean = oneOff.profile.keep;
// @ts-expect-error -- wand uses the same deep omit program.
void oneOff.profile.secret;
void oneOffKeep;

// @ts-expect-error -- flat batches retain their known-key contract.
spell<Model>().omit(['unknown']);
// Missing tuple selectors are tolerated consistently at runtime and in output types.
spell<Model>().omit([['profile', 'unknown']]);

// @ts-expect-error -- dangerous nested path segments are rejected statically.
spell<Model>().omit([['profile', 'constructor']]);

// @ts-expect-error -- strict paths stop at eight segments.
spell<Model>().omit([['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']]);
