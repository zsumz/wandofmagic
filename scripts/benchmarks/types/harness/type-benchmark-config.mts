import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    readPositiveInteger,
    type Environment,
} from '../../../shared/read-positive-integer.mts';
import {
    readTypeBenchmarkSelection,
    type BuilderOperation,
    type ChainMode,
    type PathOperation,
} from './type-benchmark-selection.mts';

export interface TypeBenchmarkConfig {
    readonly builderOperation: BuilderOperation;
    readonly chainMode: ChainMode;
    readonly checkBudgetMilliseconds: number;
    readonly compilerPath: string;
    readonly operationCounts: readonly number[];
    readonly root: string;
    readonly selectedDepth: number | undefined;
    readonly selectedOperation: PathOperation | undefined;
    readonly sequentialChainLimit: number;
}

export function readTypeBenchmarkConfig(
    environment: Environment = process.env,
): TypeBenchmarkConfig {
    const root = fileURLToPath(new URL('../../../../', import.meta.url));
    return Object.freeze({
        ...readTypeBenchmarkSelection(environment),
        checkBudgetMilliseconds: readPositiveInteger(
            'WANDOFMAGIC_TYPE_BUDGET_MS',
            5_000,
            environment,
        ),
        compilerPath: join(root, 'node_modules', 'typescript', 'bin', 'tsc'),
        operationCounts: Object.freeze([10, 25, 50, 100]),
        root,
        sequentialChainLimit: readPositiveInteger(
            'WANDOFMAGIC_TYPE_CHAIN_LIMIT',
            100,
            environment,
        ),
    });
}
