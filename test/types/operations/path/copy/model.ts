import { type InferOutput, spell, wand } from 'wandofmagic';

interface Model {
    readonly profile: {
        readonly current?: number;
        readonly legacy: string;
        readonly optional?: boolean;
    };
}

const copied = spell<Model>()
    .copy(['profile', 'legacy'], ['profile', 'name'])
    .build();
declare const copiedValue: InferOutput<typeof copied>;
const legacy: string = copiedValue.profile.legacy;
const name: string = copiedValue.profile.name;
void [copied, legacy, name];

const conditional = spell<Model>()
    .copy(['profile', 'optional'], ['result', 'enabled'], { missing: 'skip' })
    .build();
declare const conditionalValue: InferOutput<typeof conditional>;
const result: { enabled?: boolean } | undefined = conditionalValue.result;
void [conditional, result];

const copyInput: { source: string; target: number } = { source: 'value', target: 7 };
const overwritten = wand(copyInput)
    .copy('source', 'target', { conflict: 'overwrite' })
    .value();
const target: string = overwritten.target;
const source: string = overwritten.source;
void [target, source];
