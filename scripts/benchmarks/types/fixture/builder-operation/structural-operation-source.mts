import type { TypeBenchmarkConfig } from '../../harness/type-benchmark-config.mts';
import { existingPath, movedPath } from '../fixture-paths.mts';
import { builderPathSource, operationDepth } from './operation-path-source.mts';

export function builderOmitOperationSource(
    index: number,
    config: TypeBenchmarkConfig,
): string {
    const path = builderPathSource(existingPath(index, operationDepth(index, config)));
    return `    .omit([${path} as const])`;
}

export function builderMoveOperationSource(
    index: number,
    config: TypeBenchmarkConfig,
): string {
    const depth = operationDepth(index, config);
    const source = builderPathSource(existingPath(index, depth));
    const destination = builderPathSource(movedPath(index, depth));
    const options = index % 3 === 1
        ? ', { conflict: \'overwrite\', missing: \'skip\' }'
        : index % 3 === 2 ? ', { conflict: \'preserve\' }' : '';
    return `    .move(${source} as const, ${destination} as const${options})`;
}
