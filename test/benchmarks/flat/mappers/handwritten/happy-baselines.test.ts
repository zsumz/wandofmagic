import { describe, expect, it } from 'vitest';
import type { BenchmarkMapper } from '../../../../../scripts/benchmarks/flat/harness/benchmark-types.mts';
import { runHandwrittenForInHappy } from '../../../../../scripts/benchmarks/flat/mappers/handwritten/for-in-happy.mts';
import {
    runHandwrittenObjectKeysHappy,
} from '../../../../../scripts/benchmarks/flat/mappers/handwritten/object-keys-happy.mts';
import {
    runHandwrittenSpreadHistorical,
} from '../../../../../scripts/benchmarks/flat/mappers/handwritten/spread-historical.mts';
import { createCorpus } from '../../../../../scripts/benchmarks/flat/scenario/corpus.mts';

const baselines: ReadonlyArray<readonly [string, BenchmarkMapper]> = [
    ['for-in', runHandwrittenForInHappy],
    ['Object.keys', runHandwrittenObjectKeysHappy],
    ['historical spread', runHandwrittenSpreadHistorical],
];

describe('handwritten happy-path baselines', () => {
    it.each(baselines)('%s produces the benchmark output shape', (_name, mapper) => {
        const input = createCorpus(10, 1)[0];

        expect(mapper(input)).toEqual({
            active: false,
            age: 20,
            displayName: 'Ada0 Lovelace0',
            email: 'ada-0@example.com',
            extra_5: 5,
            extra_6: 6,
            extra_7: 7,
            extra_8: 8,
            extra_9: 9,
            firstName: 'Ada0',
            lastName: 'Lovelace0',
        });
    });
});
