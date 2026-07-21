import { describe, expect, it } from 'vitest';
import {
    medianThroughput,
} from '../../../../scripts/benchmarks/flat/harness/benchmark-runner.mts';

describe('flat benchmark runner', () => {
    it('selects the upper median used by the benchmark report', () => {
        expect(medianThroughput([30, 10, 20], 'fixture')).toBe(20);
        expect(medianThroughput([40, 10, 30, 20], 'fixture')).toBe(30);
    });

    it('rejects an empty sample set', () => {
        expect(() => medianThroughput([], 'fixture')).toThrow(
            'No benchmark samples were captured for fixture.',
        );
    });
});
