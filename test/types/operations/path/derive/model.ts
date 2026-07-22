import { type InferOutput, spell, wand } from 'wandofmagic';

interface Model {
    readonly prefix: string;
    readonly profile: { readonly first: string; readonly last?: string };
}

const normalize = spell<Model>()
    .default(['profile', 'last'], 'Lovelace')
    .derive(
        ['profile', 'displayName'],
        ['prefix', ['profile', 'first'], ['profile', 'last']],
        ([prefix, first, last]) => `${prefix} ${first} ${last}`,
    )
    .build();
declare const value: InferOutput<typeof normalize>;
const displayName: string = value.profile.displayName;
const last: string = value.profile.last;
void [normalize, displayName, last];

const oneOff = wand({ source: { count: 2 } })
    .derive(['summary', 'count'], [['source', 'count']], ([count]) => String(count))
    .value();
const count: string = oneOff.summary.count;
void count;
