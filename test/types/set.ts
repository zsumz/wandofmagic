import { type InferOutput, spell, wand } from 'wandofmagic';

interface Model {
    readonly profile?: {
        readonly name: string;
        readonly rows: Array<{ readonly label: string }>;
    };
    readonly stable: boolean;
}

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

const flatBoundary = spell<Record<never, never>>()
    .set('label', '  ready  ')
    .trim(['label'])
    .build();
const flatBoundaryLabel: string = flatBoundary.run({}).label;
void flatBoundaryLabel;

const oneOff = wand({ stable: true }).set(['metadata', 'source'], 'wand').value();
const oneOffSource: 'wand' = oneOff.metadata.source;
void oneOffSource;

// @ts-expect-error -- dangerous top-level paths are rejected statically.
spell<Model>().set('constructor', true);

// @ts-expect-error -- dangerous nested path segments are rejected statically.
spell<Model>().set(['profile', '__proto__'], true);

// @ts-expect-error -- strict paths stop at eight segments.
spell<Model>().set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], true);
