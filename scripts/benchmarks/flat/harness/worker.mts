import type { BenchmarkRunner, WorkerResult } from './benchmark-types.mts';
import type { FlatBenchmarkConfig } from './flat-benchmark-config.mts';
import { scaleWarmup, scaleWork } from './flat-benchmark-config.mts';
import { createCorpus } from '../scenario/corpus.mts';
import { benchmarkRunner } from './benchmark-runner.mts';

export function runWorker(
    name: string,
    runners: readonly BenchmarkRunner[],
    config: FlatBenchmarkConfig,
): void {
    const runner = runners.find((candidate) => candidate.name === name);
    if (runner === undefined) {
        throw new Error(`Unknown benchmark runner: ${name}.`);
    }
    const results = config.fieldCounts.map((fieldCount) => ({
        fieldCount,
        opsPerSecond: benchmarkRunner(
            runner,
            createCorpus(fieldCount, config.corpusSize),
            fieldCount,
            scaleWork(config.baseIterations, fieldCount),
            scaleWarmup(config.warmupBase, fieldCount),
            config,
        ),
    }));
    const workerResult: WorkerResult = { name, results };
    console.log(JSON.stringify(workerResult));
}
