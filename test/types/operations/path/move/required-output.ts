import { type InferOutput, spell } from 'wandofmagic';

import type { Model } from './model.js';

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
