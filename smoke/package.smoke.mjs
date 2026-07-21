import { resolve } from 'node:path';

import { expect, smoke } from 'smoque';

smoke.suite('wandofmagic package can be packed and imported', { tags: ['package'] }, async (t) => {
    const root = t.repoRoot();
    const work = await t.tempDir('wandofmagic-package');
    const packed = work.path('packed');
    const fixtureDir = work.path('fixture');
    const npmCache = work.path('npm-cache');

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

    const tarball = await t.step('pack package artifact', async () => {
        const result = await t.cmd(
            'npm',
            ['pack', '--json', '--ignore-scripts', '--pack-destination', packed],
            {
                cwd: root,
                env: {
                    NPM_CONFIG_CACHE: npmCache,
                },
            },
        );
        const [packResult] = JSON.parse(result.stdout);

        return {
            filename: packResult.filename,
            path: resolve(packed, packResult.filename),
        };
    });

    await t.step('tarball contains the supported package surface', async () => {
        await expect
            .archive(tarball.path)
            .toContainEntries([
                'package/LICENSE',
                'package/README.md',
                'package/dist/coerce.cjs',
                'package/dist/coerce.d.cts',
                'package/dist/coerce.d.ts',
                'package/dist/coerce.js',
                'package/dist/compiler.cjs',
                'package/dist/compiler.d.cts',
                'package/dist/compiler.d.ts',
                'package/dist/compiler.js',
                'package/dist/index.cjs',
                'package/dist/index.d.cts',
                'package/dist/index.d.ts',
                'package/dist/index.js',
                'package/dist/types.d.cts',
                'package/dist/types.d.ts',
                'package/package.json',
            ]);

        await expect
            .archive(tarball.path)
            .not.toContainEntries([
                'package/eslint.config.js',
                'package/smoke/package.smoke.mjs',
                'package/src/index.ts',
                'package/test/integration.test.ts',
                'package/tsdown.config.js',
            ]);
    });

    const fixture = await t.step('create clean npm fixture', async () => {
        return await t.npm.fixture({
            dir: fixtureDir,
            packageJson: {
                private: true,
                type: 'module',
                dependencies: {},
            },
        });
    });

    await t.step('install packed package', async () => {
        await fixture.install(tarball.path, {
            scripts: 'ignore',
            audit: false,
            fund: false,
            packageLock: false,
        });
    });

    await t.step('installed package exposes runtime and declaration entrypoints', async () => {
        const pkg = fixture.package('wandofmagic');
        await pkg.toExposeOnly(['.', './coerce', './compiler']);
        await pkg.toHaveTypes(['.', './coerce', './compiler']);
    });

    await t.step('installed package works through ESM imports', async () => {
        await fixture.node.inline(`
            import { spell } from 'wandofmagic';
            import { number } from 'wandofmagic/coerce';
            import { emitTrustedMapperModule } from 'wandofmagic/compiler';

            const normalize = spell()
                .rename({ raw_count: 'count' })
                .coerce('count', number({ integer: true }))
                .omit(['secret'])
                .build();
            const result = normalize.safeRun(
                { raw_count: '7' },
                { receipt: 'discard' },
            );
            const deep = spell()
                .set(['metadata', 'source'], 'esm')
                .transform(['metadata', 'source'], (source) => source.toUpperCase())
                .move(['metadata', 'source'], ['metadata', 'origin'])
                .set(['metadata', 'count'], '7')
                .coerce(['metadata', 'count'], number())
                .default(['metadata', 'region'], 'us')
                .set(['metadata', 'private'], 'remove')
                .omit([['metadata', 'private']])
                .build()
                .run({});

            const artifact = emitTrustedMapperModule(normalize);
            if (!result.ok || result.changes.length !== 0 ||
                result.value.count !== 7 || 'raw_count' in result.value) {
                throw new Error('ESM package entrypoints returned an invalid result');
            }
            if (deep.metadata.origin !== 'ESM' || 'source' in deep.metadata ||
                deep.metadata.count !== 7 ||
                deep.metadata.region !== 'us' || 'private' in deep.metadata) {
                throw new Error('ESM deep operations returned an invalid result');
            }
            if (artifact.mode !== 'trusted-discard' ||
                !artifact.source.includes('createTrustedMapper')) {
                throw new Error('ESM compiler entrypoint returned an invalid artifact');
            }
        `);
    });

    await t.step('installed package works through CommonJS requires', async () => {
        await fixture.node.inline(`
            import { createRequire } from 'node:module';

            const require = createRequire(import.meta.url);
            const { spell } = require('wandofmagic');
            const { number } = require('wandofmagic/coerce');
            const { emitTrustedMapperModule } = require('wandofmagic/compiler');
            const normalize = spell()
                .rename({ raw_count: 'count' })
                .coerce('count', number({ integer: true }))
                .omit(['secret'])
                .build();
            const value = normalize.run({ raw_count: '9' });
            const deep = spell()
                .set(['metadata', 'source'], 'cjs')
                .transform(['metadata', 'source'], (source) => source.toUpperCase())
                .move(['metadata', 'source'], ['metadata', 'origin'])
                .set(['metadata', 'count'], '7')
                .coerce(['metadata', 'count'], number())
                .default(['metadata', 'region'], 'us')
                .set(['metadata', 'private'], 'remove')
                .omit([['metadata', 'private']])
                .build()
                .run({});
            const artifact = emitTrustedMapperModule(normalize);

            if (value.count !== 9 || deep.metadata.origin !== 'CJS' ||
                'source' in deep.metadata ||
                deep.metadata.count !== 7 || deep.metadata.region !== 'us' ||
                'private' in deep.metadata ||
                artifact.bindings.length !== 0) {
                throw new Error('CommonJS package entrypoints returned an invalid result');
            }
        `);
    });
});
