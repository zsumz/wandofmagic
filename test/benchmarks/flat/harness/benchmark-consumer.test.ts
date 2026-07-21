import { describe, expect, it, vi } from 'vitest';
import {
    createBenchmarkRunner,
} from '../../../../scripts/benchmarks/flat/harness/benchmark-consumer.mts';
import type {
    BenchmarkCorpus,
    BenchmarkOutput,
} from '../../../../scripts/benchmarks/flat/harness/benchmark-types.mts';

const corpus: BenchmarkCorpus = [{
    age: '37',
    email: 'ada@example.com',
    first_name: 'Ada',
    last_name: 'Lovelace',
    password_hash: 'hidden',
}];

describe('flat benchmark consumer', () => {
    it('freezes runner identity and consumes every mapped output', () => {
        const mapper = vi.fn((): BenchmarkOutput => benchmarkOutput(1));
        const runner = createBenchmarkRunner('fixture', mapper);

        runner.consume(corpus, 10, 3);

        expect(runner.name).toBe('fixture');
        expect(Object.isFrozen(runner)).toBe(true);
        expect(mapper).toHaveBeenCalledTimes(3);
    });

    it('rejects an output that cannot contribute to the checksum', () => {
        const runner = createBenchmarkRunner('fixture', () => benchmarkOutput(0));

        expect(() => {
            runner.consume(corpus, 10, 1);
        }).toThrow('Benchmark output was not consumed.');
    });

    it('rejects a non-finite checksum', () => {
        const runner = createBenchmarkRunner('fixture', () => benchmarkOutput(Number.NaN));

        expect(() => {
            runner.consume(corpus, 10, 1);
        }).toThrow('Benchmark output was not consumed.');
    });
});

function benchmarkOutput(extra: number): BenchmarkOutput {
    return {
        active: false,
        age: 0,
        displayName: '',
        email: '',
        extra_9: extra,
        firstName: '',
        lastName: '',
    };
}
