import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const cache = await mkdtemp(join(tmpdir(), 'wandofmagic-npm-cache-'));

try {
    const result = spawnSync(
        'npm',
        ['pack', '--dry-run', '--json', '--ignore-scripts'],
        {
            env: { ...process.env, NPM_CONFIG_CACHE: cache },
            stdio: 'inherit',
        },
    );
    if (result.error !== undefined) {
        throw result.error;
    }
    if (result.status === null) {
        throw new Error('npm pack was terminated before it returned a status.');
    }
    process.exitCode = result.status;
} finally {
    await rm(cache, { force: true, recursive: true });
}
