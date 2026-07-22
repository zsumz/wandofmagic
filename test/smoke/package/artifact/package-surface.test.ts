import { describe, expect, it } from 'vitest';
import {
    expectedPackageEntries,
    forbiddenPackageEntries,
} from '../../../../smoke/package/artifact/package-surface.mts';

describe('packed package surface', () => {
    it('contains only supported runtime and declaration artifacts', () => {
        expect(expectedPackageEntries).toEqual([
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
    });

    it('excludes representative development-only files', () => {
        expect(forbiddenPackageEntries).toEqual([
            'package/eslint.config.mts',
            'package/smoke/package.smoke.mts',
            'package/src/index.ts',
            'package/test/integration.test.ts',
            'package/tsdown.config.mts',
            'package/vitest.config.mts',
        ]);
    });

    it('contains no duplicate or contradictory expectations', () => {
        expect(new Set(expectedPackageEntries).size).toBe(expectedPackageEntries.length);
        expect(new Set(forbiddenPackageEntries).size).toBe(forbiddenPackageEntries.length);
        expect(expectedPackageEntries.filter((entry) =>
            forbiddenPackageEntries.includes(entry))).toEqual([]);
    });
});
