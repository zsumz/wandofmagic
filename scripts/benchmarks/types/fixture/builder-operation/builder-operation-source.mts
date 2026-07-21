import type { TypeBenchmarkConfig } from '../../harness/type-benchmark-config.mts';
import {
    builderMoveOperationSource,
    builderOmitOperationSource,
} from './structural-operation-source.mts';
import {
    builderCoerceOperationSource,
    builderTransformOperationSource,
} from './transform-operation-source.mts';
import {
    builderDefaultOperationSource,
    builderSetOperationSource,
} from './write-operation-source.mts';

export function builderOperationSource(index: number, config: TypeBenchmarkConfig): string {
    const selected = config.builderOperation;
    if (selected === 'set' || selected === 'mixed' && index % 6 === 0) {
        return builderSetOperationSource(index, config);
    }
    if (selected === 'default' || selected === 'mixed' && index % 6 === 1) {
        return builderDefaultOperationSource(index, config);
    }
    if (selected === 'omit' || selected === 'mixed' && index % 6 === 4) {
        return builderOmitOperationSource(index, config);
    }
    if (selected === 'coerce' || selected === 'mixed' && index % 6 === 3) {
        return builderCoerceOperationSource(index, config);
    }
    if (selected === 'move' || selected === 'mixed' && index % 6 === 5) {
        return builderMoveOperationSource(index, config);
    }
    return builderTransformOperationSource(index, config);
}
