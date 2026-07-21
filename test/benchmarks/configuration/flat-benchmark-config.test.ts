import { describe, expect, it } from 'vitest';
import {
    readFlatBenchmarkConfig,
    scaleWarmup,
    scaleWork,
} from '../../../scripts/benchmarks/flat/harness/flat-benchmark-config.mts';

describe('flat benchmark configuration', () => {
    it('reads stable defaults from an empty environment', () => {
        const config = readFlatBenchmarkConfig({});

        expect(config).toEqual({
            baseIterations: 20_000,
            corpusSize: 256,
            fieldCounts: [10, 50, 200],
            rounds: 7,
            selectedRunner: undefined,
            warmupBase: 10_000,
        });
        expect(Object.isFrozen(config)).toBe(true);
        expect(Object.isFrozen(config.fieldCounts)).toBe(true);
    });

    it('reads every supported environment override', () => {
        expect(readFlatBenchmarkConfig({
            WANDOFMAGIC_BENCH_CORPUS: '32',
            WANDOFMAGIC_BENCH_ITERATIONS: '4000',
            WANDOFMAGIC_BENCH_ROUNDS: '3',
            WANDOFMAGIC_BENCH_RUNNER: 'compiled trusted mapper',
            WANDOFMAGIC_BENCH_WARMUP: '2000',
        })).toMatchObject({
            baseIterations: 4_000,
            corpusSize: 32,
            rounds: 3,
            selectedRunner: 'compiled trusted mapper',
            warmupBase: 2_000,
        });
    });

    it.each([
        [scaleWork, 1_000],
        [scaleWarmup, 10_000],
    ] as const)('keeps scaled work above its floor', (scale, floor) => {
        expect(scale(1, 200)).toBe(floor);
    });
});
