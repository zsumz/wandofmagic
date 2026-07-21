import { type InferOutput, spell } from 'wandofmagic';

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
