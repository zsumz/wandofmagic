import type { TypeBenchmarkConfig } from '../../harness/type-benchmark-config.mts';
import type { PathOperation } from '../../harness/type-benchmark-selection.mts';
import { additionPath, existingPath } from '../fixture-paths.mts';

const operationKinds = ['replace', 'require', 'add', 'omit'] as const;
const operationUtilities = ['ReplaceAtPath', 'RequireAtPath', 'AddAtPath', 'OmitAtPath'] as const;

export interface SelectedPathOperation {
    readonly kind: typeof operationKinds[number];
    readonly path: string;
    readonly utility: typeof operationUtilities[number];
    readonly writesValue: boolean;
}

export function selectPathOperation(
    index: number,
    config: TypeBenchmarkConfig,
): SelectedPathOperation {
    const operation = config.selectedOperation ?? operationAt(index);
    const depth = config.selectedDepth ?? index % 8 + 1;
    return Object.freeze({
        kind: operationKinds[operation],
        path: operation === 2 ? additionPath(index, depth) : existingPath(index, depth),
        utility: operationUtilities[operation],
        writesValue: operation !== 3,
    });
}

export function pathOperationUtility(operation: PathOperation): string {
    return operationUtilities[operation];
}

function operationAt(index: number): PathOperation {
    return index % 4 as PathOperation;
}
