import type { Environment } from '../../../shared/read-positive-integer.mts';

export type BuilderOperation =
    'coerce' | 'default' | 'mixed' | 'move' | 'omit' | 'set' | 'transform';
export type ChainMode = 'builder' | 'materialized' | 'program';
export type PathOperation = 0 | 1 | 2 | 3;

export interface TypeBenchmarkSelection {
    readonly builderOperation: BuilderOperation;
    readonly chainMode: ChainMode;
    readonly selectedDepth: number | undefined;
    readonly selectedOperation: PathOperation | undefined;
}

export function readTypeBenchmarkSelection(
    environment: Environment,
): TypeBenchmarkSelection {
    return Object.freeze({
        builderOperation: readBuilderOperation(environment['WANDOFMAGIC_TYPE_BUILDER_OPERATION']),
        chainMode: readChainMode(environment['WANDOFMAGIC_TYPE_CHAIN_MODE']),
        selectedDepth: readDepth(environment['WANDOFMAGIC_TYPE_DEPTH']),
        selectedOperation: readOperation(environment['WANDOFMAGIC_TYPE_OPERATION']),
    });
}

function readBuilderOperation(value: string | undefined): BuilderOperation {
    if (value === undefined || value === 'mixed') {
        return 'mixed';
    }
    if (value === 'coerce' || value === 'default' || value === 'move' || value === 'omit'
        || value === 'set' || value === 'transform') {
        return value;
    }
    throw new TypeError(
        'WANDOFMAGIC_TYPE_BUILDER_OPERATION must be coerce, default, move, omit, set, transform, or mixed.',
    );
}

function readDepth(value: string | undefined): number | undefined {
    if (value === undefined || value === 'mixed') {
        return undefined;
    }
    const depth = Number(value);
    if (!Number.isSafeInteger(depth) || depth < 1 || depth > 8) {
        throw new TypeError('WANDOFMAGIC_TYPE_DEPTH must be an integer from 1 through 8 or mixed.');
    }
    return depth;
}

function readOperation(value: string | undefined): PathOperation | undefined {
    if (value === undefined || value === 'mixed') {
        return undefined;
    }
    const operations: readonly string[] = ['replace', 'require', 'add', 'omit'];
    const index = operations.indexOf(value);
    if (index < 0 || index > 3) {
        throw new TypeError('WANDOFMAGIC_TYPE_OPERATION must be replace, require, add, omit, or mixed.');
    }
    return index as PathOperation;
}

function readChainMode(value: string | undefined): ChainMode {
    if (value === undefined || value === 'builder') {
        return 'builder';
    }
    if (value === 'materialized' || value === 'program') {
        return value;
    }
    throw new TypeError('WANDOFMAGIC_TYPE_CHAIN_MODE must be builder, program, or materialized.');
}
