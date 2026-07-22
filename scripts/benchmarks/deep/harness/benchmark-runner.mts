import { performance } from 'node:perf_hooks';
import type { DeepBenchmarkConfig } from './deep-benchmark-config.mts';
import type { DeepBenchmarkRunner } from './benchmark-types.mts';
import type {
    DeepBenchmarkCorpus,
    DeepBenchmarkOutput,
} from '../scenario/model.mts';

export function createDeepBenchmarkRunner(
    name: string,
    run: DeepBenchmarkRunner['run'],
): DeepBenchmarkRunner {
    return Object.freeze({ consume: createConsumer(run), name, run });
}

export function benchmarkDeepRunner(
    runner: DeepBenchmarkRunner,
    corpus: DeepBenchmarkCorpus,
    config: DeepBenchmarkConfig,
): number {
    const samples: number[] = [];
    runner.consume(corpus, config.warmupIterations);
    for (let round = 0; round < config.rounds; round += 1) {
        const started = performance.now();
        runner.consume(corpus, config.iterations);
        samples.push(config.iterations / ((performance.now() - started) / 1_000));
    }
    samples.sort((left, right) => left - right);
    const median = samples[Math.floor(samples.length / 2)];
    if (median === undefined) {
        throw new Error(`No benchmark samples were captured for ${runner.name}.`);
    }
    return median;
}

function createConsumer(run: DeepBenchmarkRunner['run']): DeepBenchmarkRunner['consume'] {
    return (corpus, iterations) => {
        let checksum = 0;
        for (let iteration = 0; iteration < iterations; iteration += 1) {
            // The modulo index is always inside this non-empty corpus.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const input = corpus[iteration % corpus.length]!;
            checksum += consumeOutput(run(input));
        }
        if (!Number.isFinite(checksum) || checksum === 0) {
            throw new Error('Deep benchmark output was not consumed.');
        }
    };
}

function consumeOutput(output: DeepBenchmarkOutput): number {
    return output.profile.age
        + Number(output.profile.active)
        + output.profile.first.length
        + output.profile.last.length
        + output.profile.contact.email.length
        + output.metadata.owner.length
        + output.summary.displayName.length;
}
