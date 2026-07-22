import { type InferOutput, spell, wand } from 'wandofmagic';

interface Model {
    readonly profile?: {
        readonly alias?: string | null;
        readonly name: string;
    };
    readonly rows: Array<{ readonly label: string }>;
    readonly stable: number;
}

const normalize = spell<Model>()
    .trim([['profile', 'name'], ['profile', 'alias'], ['rows', 0, 'label']])
    .build();
declare const value: InferOutput<typeof normalize>;
const expected: Model = value;
void [normalize, expected];

const composed = wand({ profile: { name: ' Ada ' } })
    .set(['profile', 'alias'], ' Countess ')
    .trim([['profile', 'name'], ['profile', 'alias']])
    .value();
const alias: string = composed.profile.alias;
void alias;
