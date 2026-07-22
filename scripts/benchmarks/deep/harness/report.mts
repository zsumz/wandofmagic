import type { DeepWorkerResult } from './benchmark-types.mts';
import type { DeepBenchmarkConfig } from './deep-benchmark-config.mts';

export function formatDeepReport(
    results: readonly DeepWorkerResult[],
    config: DeepBenchmarkConfig,
): object {
    const handwritten = readThroughput(results, 'handwritten-deep-happy');
    const trusted = readThroughput(results, 'wandofmagic-deep-trusted');
    return {
        corpusSize: config.corpusSize,
        isolatedRunners: true,
        iterations: config.iterations,
        measurements: results.map((result) => ({
            name: result.name,
            nanosecondsPerRecord: Math.round(1_000_000_000 / result.opsPerSecond),
            opsPerSecond: Math.round(result.opsPerSecond),
            relativeToHandwrittenHappy: roundRatio(result.opsPerSecond / handwritten),
            relativeToTrusted: roundRatio(result.opsPerSecond / trusted),
        })),
        node: process.version,
        rounds: config.rounds,
        warmupIterations: config.warmupIterations,
    };
}

function readThroughput(results: readonly DeepWorkerResult[], name: string): number {
    const result = results.find((candidate) => candidate.name === name);
    if (result === undefined) {
        throw new Error(`Missing ${name} result from the deep benchmark.`);
    }
    return result.opsPerSecond;
}

function roundRatio(value: number): number {
    return Math.round(value * 1_000) / 1_000;
}
