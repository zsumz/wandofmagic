import type { NpmFixture, SmokeContext } from 'smoque';
import type { PackedPackage } from './packed-package.mts';

export async function installPackageFixture(
    t: SmokeContext,
    fixtureDir: string,
    tarball: PackedPackage,
): Promise<NpmFixture> {
    const fixture = await t.step('create clean npm fixture', async () =>
        await t.npm.fixture({
            dir: fixtureDir,
            packageJson: { dependencies: {}, private: true, type: 'module' },
        }));
    await t.step('install packed package', async () => {
        await fixture.install(tarball.path, {
            audit: false,
            fund: false,
            packageLock: false,
            scripts: 'ignore',
        });
    });
    return fixture;
}
