import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import {
    allowedArchitectureRootModules,
    allowedRootTestModules,
    groupedTestDirectories,
    isUngroupedArchitectureModule,
    isUngroupedTestModule,
} from '../../scripts/architecture/module/module-layout.mts';
import {
    facadeDirectories,
    isPureReExportFacade,
} from '../../scripts/architecture/module/source-facades.mts';

function parse(source: string): ts.SourceFile {
    return ts.createSourceFile('facade.ts', source, ts.ScriptTarget.Latest, true);
}

describe('root facade architecture', () => {
    it('reserves the test root for cross-feature integration', () => {
        expect(allowedRootTestModules).toEqual(new Set(['test/integration.test.ts']));
    });

    it('reserves the architecture root for its command', () => {
        expect(allowedArchitectureRootModules).toEqual(new Set([
            'scripts/architecture/check.mts',
        ]));
        expect(isUngroupedArchitectureModule('scripts/architecture/extra.mts')).toBe(true);
        expect(isUngroupedArchitectureModule('scripts/architecture/module/extra.mts')).toBe(false);
        expect(isUngroupedArchitectureModule('scripts/architecture/check.mts')).toBe(false);
    });

    it('protects implementation-free source boundaries', () => {
        expect(facadeDirectories).toEqual(new Set([
            'src/builder',
            'src/compiler',
            'src/core',
            'src/instructions',
            'src/internal',
            'src/runtime',
            'src/types',
        ]));
    });

    it('protects grouped test boundaries', () => {
        expect(groupedTestDirectories).toEqual(new Set([
            'test/operations',
            'test/operations/flat',
            'test/types',
        ]));
        expect(isUngroupedTestModule('test/types/api.ts')).toBe(true);
        expect(isUngroupedTestModule('test/types/api/public-api.ts')).toBe(false);
        expect(isUngroupedTestModule('test/operations/flat/semantics.test.ts')).toBe(true);
        expect(isUngroupedTestModule('test/operations/flat/pipeline/semantics.test.ts')).toBe(false);
    });

    it('accepts value and type re-exports', () => {
        const source = [
            'export { run } from \'./run.js\';',
            'export type { Result } from \'./result.js\';',
        ].join('\n');

        expect(isPureReExportFacade(parse(source))).toBe(true);
    });

    it.each([
        '',
        'import { run } from \'./run.js\'; export { run };',
        'export function run(): void {}',
        'const value = 1; export { value };',
    ])('rejects implementation source %#', (source) => {
        expect(isPureReExportFacade(parse(source))).toBe(false);
    });
});
