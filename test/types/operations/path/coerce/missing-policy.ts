import { type InferOutput, spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';

import type { Model } from './model.js';

const skipped = spell<Model>()
    .coerce(['profile', 'count'], number(), { missing: 'skip' })
    .build();
type SkippedOutput = InferOutput<typeof skipped>;
declare const skippedOutput: SkippedOutput;
if (skippedOutput.profile?.count !== undefined) {
    const skippedCount: number = skippedOutput.profile.count;
    void skippedCount;
}
void skipped;

spell<{ count?: string }>().coerce('count', number(), { missing: 'skip' });
