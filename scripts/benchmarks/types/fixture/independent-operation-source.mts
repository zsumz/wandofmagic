import type { TypeBenchmarkConfig } from '../harness/type-benchmark-config.mts';
import {
    materializedOperationSource,
} from './path-operation/materialized-operation-source.mts';

export interface IndependentOperationSource {
    readonly definitions: string;
    readonly resultTypes: string;
}

export function createIndependentOperationSource(
    operationCount: number,
    config: TypeBenchmarkConfig,
): IndependentOperationSource {
    const names = Array.from(
        { length: operationCount },
        (_, index) => `Independent${String(index)}`,
    );
    return Object.freeze({
        definitions: names.map((name, index) =>
            materializedOperationSource('BenchmarkModel', name, index, config)).join('\n'),
        resultTypes: names.join(', '),
    });
}
