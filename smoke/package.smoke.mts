import { smoke } from 'smoque';
import { assertPackageSurface } from './package/artifact/assert-package-surface.mts';
import { buildAndPack } from './package/artifact/build-and-pack.mts';
import { installPackageFixture } from './package/artifact/install-package-fixture.mts';
import { commonJsEntrypointSmoke } from './package/entrypoint/commonjs-smoke-source.mts';
import { esmEntrypointSmoke } from './package/entrypoint/esm-smoke-source.mts';

smoke.suite('wandofmagic package can be packed and imported', { tags: ['package'] }, async (t) => {
    const root = t.repoRoot();
    const work = await t.tempDir('wandofmagic-package');
    const tarball = await buildAndPack(t, root, work.path('packed'), work.path('npm-cache'));

    await assertPackageSurface(t, tarball);
    const fixture = await installPackageFixture(t, work.path('fixture'), tarball);

    await t.step('installed package exposes runtime and declaration entrypoints', async () => {
        const pkg = fixture.package('wandofmagic');
        await pkg.toExposeOnly(['.', './coerce', './compiler']);
        await pkg.toHaveTypes(['.', './coerce', './compiler']);
    });
    await t.step('installed package works through ESM imports', async () => {
        await fixture.node.inline(esmEntrypointSmoke);
    });
    await t.step('installed package works through CommonJS requires', async () => {
        await fixture.node.inline(commonJsEntrypointSmoke);
    });
});
