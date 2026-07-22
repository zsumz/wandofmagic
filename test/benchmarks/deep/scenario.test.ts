import { describe, expect, it } from 'vitest';
import { createDeepCorpus } from '../../../scripts/benchmarks/deep/scenario/corpus.mts';
import { runHandwrittenDeepHappy } from '../../../scripts/benchmarks/deep/mappers/handwritten-happy.mts';
import { runWandofmagicDeepTrusted } from '../../../scripts/benchmarks/deep/mappers/wandofmagic-mappers.mts';

describe('deep benchmark scenario', () => {
    it('keeps the handwritten ceiling equivalent on valid corpus records', () => {
        const corpus = createDeepCorpus(8);
        for (const input of corpus) {
            expect(runHandwrittenDeepHappy(input)).toEqual(runWandofmagicDeepTrusted(input));
        }
    });

    it('rejects invalid corpus sizes', () => {
        expect(() => createDeepCorpus(0)).toThrow(
            'Deep benchmark corpus size must be a positive integer.',
        );
    });
});
