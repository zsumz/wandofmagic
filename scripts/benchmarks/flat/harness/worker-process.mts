import { spawnSync } from 'node:child_process';
import type { WorkerMeasurement, WorkerResult } from './benchmark-types.mts';

export function runIsolatedBenchmark(entryPath: string, name: string): WorkerResult {
    const result = spawnSync(process.execPath, [entryPath], {
        encoding: 'utf8',
        env: { ...process.env, WANDOFMAGIC_BENCH_RUNNER: name },
        maxBuffer: 10 * 1024 * 1024,
    });
    if (result.error !== undefined) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(`${name} benchmark worker failed: ${result.stderr.trim()}`);
    }
    const worker = parseWorkerResult(result.stdout);
    if (worker.name !== name) {
        throw new Error(`The ${name} benchmark worker identified itself as ${worker.name}.`);
    }
    return worker;
}

export function parseWorkerResult(output: string): WorkerResult {
    const parsed: unknown = JSON.parse(output);
    if (!isWorkerResult(parsed)) {
        throw new TypeError('A flat benchmark worker returned an invalid result.');
    }
    return parsed;
}

function isWorkerResult(value: unknown): value is WorkerResult {
    return typeof value === 'object'
        && value !== null
        && 'name' in value
        && typeof value.name === 'string'
        && 'results' in value
        && Array.isArray(value.results)
        && value.results.every(isWorkerMeasurement);
}

function isWorkerMeasurement(value: unknown): value is WorkerMeasurement {
    return typeof value === 'object'
        && value !== null
        && 'fieldCount' in value
        && typeof value.fieldCount === 'number'
        && Number.isSafeInteger(value.fieldCount)
        && value.fieldCount > 0
        && 'opsPerSecond' in value
        && typeof value.opsPerSecond === 'number'
        && Number.isFinite(value.opsPerSecond)
        && value.opsPerSecond > 0;
}
