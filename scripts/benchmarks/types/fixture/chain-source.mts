import type { TypeBenchmarkConfig } from '../harness/type-benchmark-config.mts';
import { createBuilderDefinition } from './builder-template.mts';
import {
    materializedOperationSource,
} from './path-operation/materialized-operation-source.mts';
import {
    programOperationSource,
} from './path-operation/program-operation-source.mts';

export function chainDefinitionSource(
    chainCount: number,
    config: TypeBenchmarkConfig,
): string {
    if (config.chainMode === 'builder') {
        return createBuilderDefinition(chainCount, config);
    }
    const input = config.chainMode === 'program' ? 'readonly []' : 'BenchmarkModel';
    const chain = Array.from({ length: chainCount }, (_, index) =>
        config.chainMode === 'program'
            ? programOperationSource(
                `Step${String(index)}`, `Step${String(index + 1)}`, index, config,
            )
            : materializedOperationSource(
                `Step${String(index)}`, `Step${String(index + 1)}`, index, config,
            ),
    ).join('\n');
    return `type Step0 = ${input};
${chain}`;
}

export function chainOutputSource(chainCount: number, config: TypeBenchmarkConfig): string {
    if (config.chainMode === 'program') {
        return `EvaluatePathTypeOperations<BenchmarkModel, Step${String(chainCount)}>`;
    }
    return config.chainMode === 'builder'
        ? 'InferOutput<typeof chainedBuilder>'
        : `Step${String(chainCount)}`;
}
