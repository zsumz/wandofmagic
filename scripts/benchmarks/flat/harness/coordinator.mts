import type { BenchmarkRunner } from './benchmark-types.mts';
import type { FlatBenchmarkConfig } from './flat-benchmark-config.mts';
import { formatFieldResult } from './format-field-result.mts';
import { runIsolatedBenchmark } from './worker-process.mts';

export function runCoordinator(
    entryPath: string,
    runners: readonly BenchmarkRunner[],
    config: FlatBenchmarkConfig,
): void {
    const isolatedResults = runners.map((runner) =>
        runIsolatedBenchmark(entryPath, runner.name));
    const results = config.fieldCounts.map((fieldCount) => {
        const measurements = isolatedResults.map((worker) => {
            const measurement = worker.results.find((candidate) =>
                candidate.fieldCount === fieldCount);
            if (measurement === undefined) {
                throw new Error(
                    `The ${worker.name} worker omitted the ${String(fieldCount)}-field result.`,
                );
            }
            return { name: worker.name, opsPerSecond: measurement.opsPerSecond };
        });
        return formatFieldResult(fieldCount, measurements, config);
    });

    console.log(JSON.stringify({
        corpusSize: config.corpusSize,
        isolatedRunners: true,
        node: process.version,
        results,
        rounds: config.rounds,
    }, null, 2));
}
