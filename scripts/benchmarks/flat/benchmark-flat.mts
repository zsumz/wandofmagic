import { fileURLToPath } from 'node:url';
import { readFlatBenchmarkConfig } from './harness/flat-benchmark-config.mts';
import { runCoordinator } from './harness/coordinator.mts';
import { createRunnerCatalog } from './harness/create-runner-catalog.mts';
import { assertEquivalent } from './harness/equivalence.mts';
import { runWorker } from './harness/worker.mts';
import { createGeneratedMapper } from './mappers/generated-mapper.mts';
import { createCorpus } from './scenario/corpus.mts';

const config = readFlatBenchmarkConfig();
const needsGeneratedMapper = config.selectedRunner === undefined
    || config.selectedRunner === 'wandofmagic-generated';
const generatedMapper = needsGeneratedMapper ? await createGeneratedMapper() : undefined;
const runners = createRunnerCatalog(generatedMapper);

if (config.selectedRunner === undefined) {
    if (generatedMapper === undefined) {
        throw new Error('The generated mapper is required by the benchmark coordinator.');
    }
    for (const fieldCount of config.fieldCounts) {
        assertEquivalent(createCorpus(fieldCount, config.corpusSize), generatedMapper);
    }
    runCoordinator(fileURLToPath(import.meta.url), runners, config);
} else {
    runWorker(config.selectedRunner, runners, config);
}
