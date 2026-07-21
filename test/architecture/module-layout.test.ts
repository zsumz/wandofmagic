import { describe, expect, it } from 'vitest';
import {
    inspectModuleLayout,
    moduleLineLimit,
} from '../../scripts/architecture/module/module-layout.mts';

describe('module layout policy', () => {
    it.each([
        'src/feature/common.ts',
        'scripts/feature/config.mts',
        'scripts/feature/helpers.mts',
        'test/feature/utils.ts',
    ])('rejects the generic module name in %s', (relative) => {
        expect(inspectModuleLayout(relative, 1)).toEqual([
            `${relative}: generic junk-drawer module names are forbidden.`,
        ]);
    });

    it('rejects unregistered source entrypoints', () => {
        expect(inspectModuleLayout('src/feature/index.ts', 1)).toEqual([
            'src/feature/index.ts: add public entrypoints deliberately '
            + 'and update the architecture contract.',
        ]);
    });

    it.each([
        'src/index.ts',
        'src/coerce/index.ts',
        'src/compiler/index.ts',
    ])('accepts registered source entrypoint %s', (relative) => {
        expect(inspectModuleLayout(relative, 1)).toEqual([]);
    });

    it('reports every violated layout rule', () => {
        expect(inspectModuleLayout('test/utils.ts', moduleLineLimit + 1)).toEqual([
            'test/utils.ts: generic junk-drawer module names are forbidden.',
            'test/utils.ts: feature tests belong in an owned test subdirectory.',
            `test/utils.ts: ${String(moduleLineLimit + 1)} lines exceeds the `
            + `${String(moduleLineLimit)}-line limit.`,
        ]);
    });
});
