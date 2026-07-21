import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import type { TypeBenchmarkConfig } from './type-benchmark-config.mts';
import {
    readCompilerMetrics,
    type TypeBenchmarkMeasurement,
} from './compiler-metrics.mts';

export function compileFixture(
    operations: number,
    temporaryRoot: string,
    config: TypeBenchmarkConfig,
): TypeBenchmarkMeasurement {
    const configPath = join(temporaryRoot, String(operations), 'tsconfig.json');
    const started = performance.now();
    const result = spawnSync(process.execPath, [
        config.compilerPath,
        '--extendedDiagnostics',
        '--pretty',
        'false',
        '--project',
        configPath,
    ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const wallMilliseconds = performance.now() - started;
    if (result.error !== undefined) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(
            `The ${String(operations)}-operation fixture failed:\n${result.stdout}${result.stderr}`,
        );
    }
    return readCompilerMetrics(result.stdout, operations, wallMilliseconds);
}
