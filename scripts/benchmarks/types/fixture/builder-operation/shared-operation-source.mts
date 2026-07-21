import type { TypeBenchmarkConfig } from '../../harness/type-benchmark-config.mts';
import { existingPath } from '../fixture-paths.mts';
import { builderPathSource } from './operation-path-source.mts';

export function builderSharedTransformOperationSource(
    index: number,
    skip: boolean,
    config: TypeBenchmarkConfig,
): string {
    const path = sharedExistingPath(config.selectedDepth ?? 8);
    const options = skip ? ', { missing: \'skip\' }' : '';
    return `    .transform(${path} as const, (value) => String(value).length + ${String(index)}${options})`;
}

export function builderSharedCoerceOperationSource(
    skip: boolean,
    config: TypeBenchmarkConfig,
): string {
    const path = sharedExistingPath(Math.max(2, config.selectedDepth ?? 8));
    const options = skip ? ', { missing: \'skip\' }' : '';
    return `    .coerce(${path} as const, number()${options})`;
}

export function builderSharedDefaultOperationSource(config: TypeBenchmarkConfig): string {
    const path = sharedExistingPath(config.selectedDepth ?? 8);
    return `    .default(${path} as const, 'fallback')`;
}

export function builderSharedOmitOperationSource(config: TypeBenchmarkConfig): string {
    const path = sharedExistingPath(config.selectedDepth ?? 8);
    return `    .omit([${path} as const])`;
}

function sharedExistingPath(depth: number): string {
    return builderPathSource(existingPath(0, depth));
}
