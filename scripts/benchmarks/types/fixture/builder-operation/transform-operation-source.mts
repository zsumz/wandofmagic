import type { TypeBenchmarkConfig } from '../../harness/type-benchmark-config.mts';
import { existingPath } from '../fixture-paths.mts';
import { builderPathSource, operationDepth } from './operation-path-source.mts';

export function builderTransformOperationSource(
    index: number,
    config: TypeBenchmarkConfig,
): string {
    const path = builderPathSource(existingPath(index, operationDepth(index, config)));
    return `    .transform(${path} as const, (value) => String(value).length + ${String(index)})`;
}

export function builderCoerceOperationSource(
    index: number,
    config: TypeBenchmarkConfig,
): string {
    const depth = Math.max(2, operationDepth(index, config));
    const path = builderPathSource(existingPath(index, depth));
    return `    .coerce(${path} as const, number())`;
}
