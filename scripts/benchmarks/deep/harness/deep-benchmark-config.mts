import {
    readPositiveInteger,
    type Environment,
} from '../../../shared/read-positive-integer.mts';

export interface DeepBenchmarkConfig {
    readonly corpusSize: number;
    readonly iterations: number;
    readonly rounds: number;
    readonly selectedRunner: string | undefined;
    readonly warmupIterations: number;
}

export function readDeepBenchmarkConfig(
    environment: Environment = process.env,
): DeepBenchmarkConfig {
    return Object.freeze({
        corpusSize: readPositiveInteger('WANDOFMAGIC_DEEP_BENCH_CORPUS', 256, environment),
        iterations: readPositiveInteger('WANDOFMAGIC_DEEP_BENCH_ITERATIONS', 10_000, environment),
        rounds: readPositiveInteger('WANDOFMAGIC_DEEP_BENCH_ROUNDS', 7, environment),
        selectedRunner: environment['WANDOFMAGIC_DEEP_BENCH_RUNNER'],
        warmupIterations: readPositiveInteger(
            'WANDOFMAGIC_DEEP_BENCH_WARMUP',
            10_000,
            environment,
        ),
    });
}
