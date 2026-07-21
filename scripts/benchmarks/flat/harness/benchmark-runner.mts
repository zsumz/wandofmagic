import { performance } from 'node:perf_hooks';
import type {
    BenchmarkCorpus,
    BenchmarkRunner,
} from './benchmark-types.mts';
import type { FlatBenchmarkConfig } from './flat-benchmark-config.mts';

export function benchmarkRunner(
    runner: BenchmarkRunner,
    corpus: BenchmarkCorpus,
    fieldCount: number,
    iterations: number,
    warmupIterations: number,
    config: FlatBenchmarkConfig,
): number {
    const samples: number[] = [];
    runner.consume(corpus, fieldCount, warmupIterations);
    for (let round = 0; round < config.rounds; round += 1) {
        const started = performance.now();
        runner.consume(corpus, fieldCount, iterations);
        const elapsedMilliseconds = performance.now() - started;
        samples.push(iterations / (elapsedMilliseconds / 1_000));
    }
    return medianThroughput(samples, runner.name);
}

export function medianThroughput(samples: number[], runnerName: string): number {
    samples.sort((left, right) => left - right);
    const median = samples[Math.floor(samples.length / 2)];
    if (median === undefined) {
        throw new Error(`No benchmark samples were captured for ${runnerName}.`);
    }
    return median;
}
