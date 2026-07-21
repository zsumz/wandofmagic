import { builderObservations } from './builder-observations.mts';
import type { TypeBenchmarkConfig } from '../harness/type-benchmark-config.mts';
import { benchmarkModelSource } from './benchmark-model-source.mts';
import { chainDefinitionSource, chainOutputSource } from './chain-source.mts';
import { fixtureImportSource } from './fixture-import-source.mts';
import { createIndependentOperationSource } from './independent-operation-source.mts';

export function createFixture(operationCount: number, config: TypeBenchmarkConfig): string {
    const chainCount = Math.min(operationCount, config.sequentialChainLimit);
    const independent = createIndependentOperationSource(operationCount, config);

    return `${fixtureImportSource(config)}

${benchmarkModelSource(operationCount)}

${chainDefinitionSource(chainCount, config)}
${independent.definitions}
type BenchmarkPaths = PathOf<BenchmarkModel>;
type IndependentResults = readonly [${independent.resultTypes}];
type ChainedOutput = ${chainOutputSource(chainCount, config)};
type ChainedKeys = keyof ChainedOutput;
type ChainedValues = ChainedOutput[ChainedKeys];
${config.chainMode === 'builder' ? builderObservations : ''}
declare const chainedKey: ChainedKeys;
declare const chainedValue: ChainedValues;
declare const independentOutput: IndependentResults;
declare const path: BenchmarkPaths;
void chainedKey;
void chainedValue;
void independentOutput;
void path;
`;
}
