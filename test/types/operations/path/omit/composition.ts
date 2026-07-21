import { spell } from 'wandofmagic';

import type { Model } from './model.js';

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
