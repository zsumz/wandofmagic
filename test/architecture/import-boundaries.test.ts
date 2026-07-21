import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { inspectSourceSyntax } from '../../scripts/architecture/module/inspect-source-syntax.mts';
import { inspectTestSyntax } from '../../scripts/architecture/module/test-import-boundaries.mts';

const root = '/workspace';
const sourceRoot = `${root}/src`;
const operationFile = `${sourceRoot}/operations/flat/coerce/create-step.ts`;
const runtimeFile = `${sourceRoot}/runtime/path/read-path.ts`;
const testFile = `${root}/test/path/read.test.ts`;

describe('operation import boundaries', () => {
    it('allows imports within one operation feature', () => {
        expect(inspect('import { compile } from \'./compile.js\';')).toEqual([]);
    });

    it.each([
        'import { create } from \'../default/create.js\';',
        'import { create } from \'../../path/coerce/create.js\';',
    ])('rejects imports across operation features in %s', (source) => {
        expect(inspect(source)).toEqual([
            'src/operations/flat/coerce/create-step.ts:1:1 '
            + 'operations modules must not import the operations layer.',
        ]);
    });

    it('rejects implementation imports through root facades', () => {
        expect(inspectAt(runtimeFile, 'import type { Path } from \'../../core/path.js\';'))
            .toEqual([
                'src/runtime/path/read-path.ts:1:1 implementation modules must import the owner '
                + 'behind src/core/path.ts.',
            ]);
    });

    it('accepts direct imports from the owning module', () => {
        expect(inspectAt(
            runtimeFile,
            'import type { Path } from \'../../core/path/path.js\';',
        )).toEqual([]);
    });

    it('allows public entrypoints to compose root facades', () => {
        expect(inspectAt(
            `${sourceRoot}/index.ts`,
            'import type { Path } from \'./core/path.js\';',
        )).toEqual([]);
    });

    it('rejects internal facade imports from tests', () => {
        expect(inspectTest('import type { Path } from \'../../src/core/path.js\';'))
            .toEqual([
                'test/path/read.test.ts:1:1 tests must import the owner behind src/core/path.ts.',
            ]);
    });

    it('allows tests to use public entrypoints', () => {
        expect(inspectTest('import type { Path } from \'../../src/index.js\';')).toEqual([]);
    });

    it('allows tests to target concrete owner modules', () => {
        expect(inspectTest(
            'import type { Path } from \'../../src/core/path/path.js\';',
        )).toEqual([]);
    });
});

function inspect(source: string): string[] {
    return inspectAt(operationFile, source);
}

function inspectAt(file: string, source: string): string[] {
    const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
    );
    return inspectSourceSyntax(root, sourceRoot, file, sourceFile);
}

function inspectTest(source: string): string[] {
    const sourceFile = ts.createSourceFile(
        testFile,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
    );
    return inspectTestSyntax(root, sourceRoot, testFile, sourceFile);
}
