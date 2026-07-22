import { describe, expect, it } from 'vitest';
import { readDeepBenchmarkConfig } from '../../../scripts/benchmarks/deep/harness/deep-benchmark-config.mts';

describe('deep benchmark configuration', () => {
    it('reads stable defaults from an empty environment', () => {
        expect(readDeepBenchmarkConfig({})).toEqual({
            corpusSize: 256,
            iterations: 10_000,
            rounds: 7,
            selectedRunner: undefined,
            warmupIterations: 10_000,
        });
    });

    it('reads every supported override', () => {
        expect(readDeepBenchmarkConfig({
            WANDOFMAGIC_DEEP_BENCH_CORPUS: '8',
            WANDOFMAGIC_DEEP_BENCH_ITERATIONS: '20',
            WANDOFMAGIC_DEEP_BENCH_ROUNDS: '3',
            WANDOFMAGIC_DEEP_BENCH_RUNNER: 'wandofmagic-deep-generated',
            WANDOFMAGIC_DEEP_BENCH_WARMUP: '10',
        })).toEqual({
            corpusSize: 8,
            iterations: 20,
            rounds: 3,
            selectedRunner: 'wandofmagic-deep-generated',
            warmupIterations: 10,
        });
    });
});
