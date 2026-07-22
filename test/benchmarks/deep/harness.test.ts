import { describe, expect, it } from 'vitest';
import type { DeepWorkerResult } from '../../../scripts/benchmarks/deep/harness/benchmark-types.mts';
import type { DeepBenchmarkConfig } from '../../../scripts/benchmarks/deep/harness/deep-benchmark-config.mts';
import { formatDeepReport } from '../../../scripts/benchmarks/deep/harness/report.mts';
import { createDeepRunnerCatalog } from '../../../scripts/benchmarks/deep/harness/runner-catalog.mts';

const config: DeepBenchmarkConfig = {
    corpusSize: 16,
    iterations: 100,
    rounds: 3,
    selectedRunner: undefined,
    warmupIterations: 50,
};

const results: readonly DeepWorkerResult[] = [
    { name: 'handwritten-deep-happy', opsPerSecond: 1_000 },
    { name: 'wandofmagic-deep-checked', opsPerSecond: 100 },
    { name: 'wandofmagic-deep-trusted', opsPerSecond: 200 },
    { name: 'wandofmagic-deep-generated', opsPerSecond: 400 },
];

describe('deep benchmark harness', () => {
    it('keeps runner names and report order stable', () => {
        expect(createDeepRunnerCatalog(undefined).map(({ name }) => name)).toEqual([
            'handwritten-deep-happy',
            'wandofmagic-deep-checked',
            'wandofmagic-deep-trusted',
            'wandofmagic-deep-generated',
        ]);
    });

    it('formats throughput against both useful baselines', () => {
        const report = formatDeepReport(results, config);

        expect(report).toMatchObject({
            corpusSize: 16,
            isolatedRunners: true,
            iterations: 100,
            rounds: 3,
            warmupIterations: 50,
        });
        expect(Reflect.get(report, 'measurements')).toContainEqual({
            name: 'wandofmagic-deep-generated',
            nanosecondsPerRecord: 2_500_000,
            opsPerSecond: 400,
            relativeToHandwrittenHappy: 0.4,
            relativeToTrusted: 2,
        });
    });

    it('rejects incomplete report baselines', () => {
        expect(() => formatDeepReport(results.slice(1), config)).toThrow(
            'Missing handwritten-deep-happy result',
        );
    });
});
