import {
    readPositiveInteger,
    type Environment,
} from '../../../shared/read-positive-integer.mts';

export interface FlatBenchmarkConfig {
    readonly baseIterations: number;
    readonly corpusSize: number;
    readonly fieldCounts: readonly number[];
    readonly rounds: number;
    readonly selectedRunner: string | undefined;
    readonly warmupBase: number;
}

export function readFlatBenchmarkConfig(
    environment: Environment = process.env,
): FlatBenchmarkConfig {
    return Object.freeze({
        baseIterations: readPositiveInteger('WANDOFMAGIC_BENCH_ITERATIONS', 20_000, environment),
        corpusSize: readPositiveInteger('WANDOFMAGIC_BENCH_CORPUS', 256, environment),
        fieldCounts: Object.freeze([10, 50, 200]),
        rounds: readPositiveInteger('WANDOFMAGIC_BENCH_ROUNDS', 7, environment),
        selectedRunner: environment['WANDOFMAGIC_BENCH_RUNNER'],
        warmupBase: readPositiveInteger('WANDOFMAGIC_BENCH_WARMUP', 10_000, environment),
    });
}

export function scaleWork(base: number, fieldCount: number): number {
    return Math.max(1_000, Math.floor(base * (10 / fieldCount)));
}

export function scaleWarmup(base: number, fieldCount: number): number {
    return Math.max(10_000, Math.floor(base * (10 / fieldCount)));
}
