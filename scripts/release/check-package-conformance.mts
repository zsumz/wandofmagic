import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const cache = await mkdtemp(join(tmpdir(), 'wandofmagic-package-conformance-'));

try {
    process.exitCode = runPackageTool(
        'publint',
        ['--strict', '--pack', 'npm'],
        cache,
    );
} finally {
    await rm(cache, { force: true, recursive: true });
}

function runPackageTool(
    command: string,
    arguments_: readonly string[],
    cache: string,
): number {
    const result = spawnSync(command, arguments_, {
        env: {
            ...process.env,
            NPM_CONFIG_CACHE: cache,
            npm_config_cache: cache,
        },
        stdio: 'inherit',
    });
    if (result.error !== undefined) {
        throw result.error;
    }
    if (result.status === null) {
        throw new Error(`${command} was terminated before it returned a status.`);
    }
    return result.status;
}
