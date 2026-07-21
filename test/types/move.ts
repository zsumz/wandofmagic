import { type InferOutput, spell, wand } from 'wandofmagic';

interface Model {
    readonly profile: {
        readonly current?: number;
        readonly legacy: string;
        readonly optional?: boolean;
    };
    readonly stable: { readonly value: number };
}

const moved = spell<Model>()
    .move(['profile', 'legacy'], ['profile', 'name'])
    .build();
type Moved = InferOutput<typeof moved>;
void moved;
declare const movedValue: Moved;
const name: string = movedValue.profile.name;
const stable: number = movedValue.stable.value;
// @ts-expect-error -- a successful required move removes its source.
void movedValue.profile.legacy;
void [name, stable];

const topLevel = spell<{ legacy: string; retained: boolean }>()
    .move('legacy', 'current')
    .build();
declare const topLevelValue: InferOutput<typeof topLevel>;
void topLevel;
const current: string = topLevelValue.current;
// @ts-expect-error -- top-level shorthand evolves through the same deferred program.
void topLevelValue.legacy;
void current;

const conditional = spell<Model>()
    .move(['profile', 'optional'], ['profile', 'current'], {
        conflict: 'overwrite',
        missing: 'skip',
    })
    .build();
declare const conditionalValue: InferOutput<typeof conditional>;
void conditional;
const optionalSource: boolean | undefined = conditionalValue.profile.optional;
const optionalDestination: boolean | number | undefined = conditionalValue.profile.current;
void [optionalSource, optionalDestination];

const conditionalNewRoot = spell<Model>()
    .move(['profile', 'optional'], ['result', 'enabled'], { missing: 'skip' })
    .build();
declare const conditionalNewRootValue: InferOutput<typeof conditionalNewRoot>;
const conditionalResult: { enabled?: boolean } | undefined = conditionalNewRootValue.result;
void [conditionalNewRoot, conditionalResult];

const preserved = spell<Model>()
    .move(['profile', 'legacy'], ['profile', 'current'], { conflict: 'preserve' })
    .build();
declare const preservedValue: InferOutput<typeof preserved>;
void preserved;
const maybeLegacy: string | undefined = preservedValue.profile.legacy;
const preservedDestination: string | number | undefined = preservedValue.profile.current;
void [maybeLegacy, preservedDestination];

const pending = spell<{ profile: { keep: boolean } }>()
    .set(['profile', 'legacy'], 'created' as const)
    .move(['profile', 'legacy'], ['result', 'name'])
    .transform(['result', 'name'], (value) => value.length)
    .build();
declare const pendingValue: InferOutput<typeof pending>;
void pending;
const pendingName: number = pendingValue.result.name;
const keep: boolean = pendingValue.profile.keep;
// @ts-expect-error -- move observes and removes a field added by pending path state.
void pendingValue.profile.legacy;
void [keep, pendingName];

const oneOff = wand({ profile: { legacy: 'value' as const } })
    .move(['profile', 'legacy'], ['profile', 'current'])
    .value();
const oneOffCurrent: 'value' = oneOff.profile.current;
// @ts-expect-error -- wand has the same move output program.
void oneOff.profile.legacy;
void oneOffCurrent;

// @ts-expect-error -- source must resolve to a current field.
spell<Model>().move(['profile', 'missing'], ['profile', 'name']);
// @ts-expect-error -- dangerous source segments are rejected statically.
spell<Model>().move(['profile', 'constructor'], ['profile', 'name']);
// @ts-expect-error -- dangerous destination segments are rejected statically.
spell<Model>().move(['profile', 'legacy'], ['profile', '__proto__']);
// @ts-expect-error -- paths share the public eight-segment budget.
spell<Model>().move(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], ['output']);
