import {
    builderOperationSource,
} from './builder-operation/builder-operation-source.mts';
import {
    builderSharedCoerceOperationSource,
    builderSharedDefaultOperationSource,
    builderSharedOmitOperationSource,
    builderSharedTransformOperationSource,
} from './builder-operation/shared-operation-source.mts';
import type { TypeBenchmarkConfig } from '../harness/type-benchmark-config.mts';

export function createBuilderDefinition(
    chainCount: number,
    config: TypeBenchmarkConfig,
): string {
    return `const chainedBuilder = spell<BenchmarkModel>()
${repeat(chainCount, (index) => builderOperationSource(index, config))}
    .build();
const sharedTransformBuilder = spell<BenchmarkModel>()
${repeat(chainCount, (index) => builderSharedTransformOperationSource(index, false, config))}
    .build();
const sharedSkipTransformBuilder = spell<BenchmarkModel>()
${repeat(chainCount, (index) => builderSharedTransformOperationSource(index, true, config))}
    .build();
const sharedCoerceBuilder = spell<BenchmarkModel>()
${repeat(chainCount, () => builderSharedCoerceOperationSource(false, config))}
    .build();
const sharedSkipCoerceBuilder = spell<BenchmarkModel>()
${repeat(chainCount, () => builderSharedCoerceOperationSource(true, config))}
    .build();
const sharedDefaultBuilder = spell<BenchmarkModel>()
${repeat(chainCount, () => builderSharedDefaultOperationSource(config))}
    .build();
const sharedOmitBuilder = spell<BenchmarkModel>()
${repeat(chainCount, () => builderSharedOmitOperationSource(config))}
    .build();`;
}

function repeat(count: number, createLine: (index: number) => string): string {
    return Array.from({ length: count }, (_, index) => createLine(index)).join('\n');
}
