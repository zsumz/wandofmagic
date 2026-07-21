import type { TypeBenchmarkConfig } from '../../harness/type-benchmark-config.mts';
import { additionPath } from '../fixture-paths.mts';
import { builderPathSource, operationDepth } from './operation-path-source.mts';

export function builderSetOperationSource(
    index: number,
    config: TypeBenchmarkConfig,
): string {
    const path = builderPathSource(additionPath(index, operationDepth(index, config)));
    return `    .set(${path} as const, ${String(index)})`;
}

export function builderDefaultOperationSource(
    index: number,
    config: TypeBenchmarkConfig,
): string {
    const path = builderPathSource(additionPath(index, operationDepth(index, config)));
    return `    .default(${path} as const, 'fallback${String(index)}')`;
}
