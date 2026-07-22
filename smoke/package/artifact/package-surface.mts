import { publicEntrypoints } from '../../../scripts/shared/public-entrypoints.mts';

const publicEntrypointArtifacts = publicEntrypoints.flatMap(({ buildName }) => [
    `package/dist/${buildName}.cjs`,
    `package/dist/${buildName}.d.cts`,
    `package/dist/${buildName}.d.ts`,
    `package/dist/${buildName}.js`,
]);

export const expectedPackageEntries = [
    'package/LICENSE',
    'package/README.md',
    'package/magicwand-logo.svg',
    ...publicEntrypointArtifacts,
    'package/dist/types.d.cts',
    'package/dist/types.d.ts',
    'package/package.json',
];

export const forbiddenPackageEntries = [
    'package/eslint.config.mts',
    'package/smoke/package.smoke.mts',
    'package/src/index.ts',
    'package/test/integration.test.ts',
    'package/tsdown.config.mts',
    'package/vitest.config.mts',
];
