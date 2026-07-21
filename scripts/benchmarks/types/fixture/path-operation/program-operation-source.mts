import type { TypeBenchmarkConfig } from '../../harness/type-benchmark-config.mts';
import { selectPathOperation } from './select-path-operation.mts';

export function programOperationSource(
    input: string,
    output: string,
    index: number,
    config: TypeBenchmarkConfig,
): string {
    const operation = selectPathOperation(index, config);
    const replacement = operation.writesValue ? '; readonly replacement: number' : '';
    return `type ${output} = AppendPathTypeOperation<${input}, { readonly kind: '${operation.kind}'; readonly path: ${operation.path}${replacement} }>;`;
}
