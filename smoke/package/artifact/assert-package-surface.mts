import { expect, type SmokeContext } from 'smoque';
import type { PackedPackage } from './packed-package.mts';
import { expectedPackageEntries, forbiddenPackageEntries } from './package-surface.mts';

export async function assertPackageSurface(
    t: SmokeContext,
    tarball: PackedPackage,
): Promise<void> {
    await t.step('tarball contains the supported package surface', async () => {
        await expect.archive(tarball.path).toContainEntries(expectedPackageEntries);
        await expect.archive(tarball.path).not.toContainEntries(forbiddenPackageEntries);
    });
}
