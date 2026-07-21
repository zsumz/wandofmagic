import type { TypeBenchmarkConfig } from '../../harness/type-benchmark-config.mts';
import { selectPathOperation } from './select-path-operation.mts';

export function materializedOperationSource(
    input: string,
    output: string,
    index: number,
    config: TypeBenchmarkConfig,
): string {
    const operation = selectPathOperation(index, config);
    const replacement = operation.writesValue ? ', number' : '';
    return `type ${output} = ${operation.utility}<${input}, ${operation.path}${replacement}>;`;
}
