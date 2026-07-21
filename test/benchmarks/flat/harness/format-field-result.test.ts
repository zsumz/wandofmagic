import { describe, expect, it } from 'vitest';
import { formatFieldResult } from '../../../../scripts/benchmarks/flat/harness/format-field-result.mts';
import type {
    FlatBenchmarkConfig,
} from '../../../../scripts/benchmarks/flat/harness/flat-benchmark-config.mts';

const config: FlatBenchmarkConfig = {
    baseIterations: 20_000,
    corpusSize: 256,
    fieldCounts: [10],
    rounds: 7,
    selectedRunner: undefined,
    warmupBase: 10_000,
};

const baselines = [
    { name: 'handwritten-for-in-happy', opsPerSecond: 100 },
    { name: 'handwritten-object-keys-happy', opsPerSecond: 80 },
    { name: 'handwritten-equivalent', opsPerSecond: 75 },
    { name: 'handwritten-spread-historical', opsPerSecond: 50 },
] as const;

describe('flat benchmark field result', () => {
    it('formats throughput and baseline ratios', () => {
        const result = formatFieldResult(
            10,
            [...baselines, { name: 'wandofmagic-generated', opsPerSecond: 90 }],
            config,
        );

        expect(result).toMatchObject({
            fieldCount: 10,
            iterations: 20_000,
            warmupIterations: 10_000,
        });
        expect(result['measurements']).toContainEqual({
            name: 'wandofmagic-generated',
            nanosecondsPerRecord: 11_111_111,
            opsPerSecond: 90,
            relativeToEquivalent: 1.2,
            relativeToHappyPathCeiling: 0.9,
            relativeToHistoricalSpread: 1.8,
        });
    });

    it('rejects an incomplete baseline set', () => {
        expect(() => formatFieldResult(10, baselines.slice(1), config)).toThrow(
            'The handwritten-for-in-happy benchmark baseline is missing.',
        );
    });
});
