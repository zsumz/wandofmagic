import { resolve } from 'node:path';
import type { PathRef, SmokeContext } from 'smoque';
import type { PackedPackage } from './packed-package.mts';
import { readPackFilename } from './read-pack-filename.mts';

export async function buildAndPack(
    t: SmokeContext,
    root: string | PathRef,
    packed: string,
    npmCache: string,
): Promise<PackedPackage> {
    await t.step('required tools are available', async () => {
        await t.tools.node({ minVersion: 22 });
        await t.tools.npm({ minVersion: 10 });
    });
    await t.step('build package', async () => {
        await t.cmd('npm', ['run', 'build'], { cwd: root });
    });
    await t.step('prepare pack destination', async () => {
        await t.fs.mkdir(packed);
        await t.fs.mkdir(npmCache);
    });

    return await t.step('pack package artifact', async () => {
        const result = await t.cmd(
            'npm',
            ['pack', '--json', '--ignore-scripts', '--pack-destination', packed],
            { cwd: root, env: { NPM_CONFIG_CACHE: npmCache } },
        );
        const parsed: unknown = JSON.parse(result.stdout);
        const filename = readPackFilename(parsed);
        return { filename, path: resolve(packed, filename) };
    });
}
