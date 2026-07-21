import { wand } from 'wandofmagic';

const oneOff = wand({ profile: { legacy: 'value' as const } })
    .move(['profile', 'legacy'], ['profile', 'current'])
    .value();
const oneOffCurrent: 'value' = oneOff.profile.current;
// @ts-expect-error -- wand has the same move output program.
void oneOff.profile.legacy;
void oneOffCurrent;
