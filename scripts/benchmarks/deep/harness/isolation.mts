import { spawnSync } from 'node:child_process';
import type { DeepWorkerResult } from './benchmark-types.mts';

export function runIsolatedDeepBenchmark(entryPath: string, name: string): DeepWorkerResult {
    const result = spawnSync(process.execPath, [entryPath], {
        encoding: 'utf8',
        env: { ...process.env, WANDOFMAGIC_DEEP_BENCH_RUNNER: name },
        maxBuffer: 10 * 1024 * 1024,
    });
    if (result.error !== undefined) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(`${name} deep benchmark worker failed: ${result.stderr.trim()}`);
    }
    return parseDeepWorkerResult(result.stdout, name);
}

function parseDeepWorkerResult(output: string, expectedName: string): DeepWorkerResult {
    const parsed: unknown = JSON.parse(output);
    if (!isDeepWorkerResult(parsed)) {
        throw new TypeError('A deep benchmark worker returned an invalid result.');
    }
    if (parsed.name !== expectedName) {
        throw new Error(
            `The ${expectedName} deep benchmark worker identified itself as ${parsed.name}.`,
        );
    }
    return parsed;
}

function isDeepWorkerResult(value: unknown): value is DeepWorkerResult {
    return typeof value === 'object'
        && value !== null
        && 'name' in value
        && typeof value.name === 'string'
        && 'opsPerSecond' in value
        && typeof value.opsPerSecond === 'number'
        && Number.isFinite(value.opsPerSecond)
        && value.opsPerSecond > 0;
}
