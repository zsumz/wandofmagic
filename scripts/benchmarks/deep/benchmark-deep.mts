import { fileURLToPath } from 'node:url';
import { benchmarkDeepRunner } from './harness/benchmark-runner.mts';
import type { DeepWorkerResult } from './harness/benchmark-types.mts';
import { readDeepBenchmarkConfig } from './harness/deep-benchmark-config.mts';
import { assertDeepEquivalent } from './harness/equivalence.mts';
import { runIsolatedDeepBenchmark } from './harness/isolation.mts';
import { formatDeepReport } from './harness/report.mts';
import { createDeepRunnerCatalog } from './harness/runner-catalog.mts';
import { createDeepGeneratedMapper } from './mappers/generated-mapper.mts';
import { createDeepCorpus } from './scenario/corpus.mts';

const config = readDeepBenchmarkConfig();
const needsGenerated = config.selectedRunner === undefined
    || config.selectedRunner === 'wandofmagic-deep-generated';
const generated = needsGenerated ? await createDeepGeneratedMapper() : undefined;
const runners = createDeepRunnerCatalog(generated);

if (config.selectedRunner === undefined) {
    assertDeepEquivalent(createDeepCorpus(config.corpusSize), runners);
    const entryPath = fileURLToPath(import.meta.url);
    const results = runners.map((runner) =>
        runIsolatedDeepBenchmark(entryPath, runner.name));
    console.log(JSON.stringify(formatDeepReport(results, config), null, 2));
} else {
    const runner = runners.find((candidate) => candidate.name === config.selectedRunner);
    if (runner === undefined) {
        throw new Error(`Unknown deep benchmark runner: ${config.selectedRunner}.`);
    }
    const result: DeepWorkerResult = {
        name: runner.name,
        opsPerSecond: benchmarkDeepRunner(
            runner,
            createDeepCorpus(config.corpusSize),
            config,
        ),
    };
    console.log(JSON.stringify(result));
}
