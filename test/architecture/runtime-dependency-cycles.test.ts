import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import {
    findDependencyCycles,
} from '../../scripts/architecture/dependency/find-dependency-cycles.mts';
import {
    runtimeModuleSpecifier,
} from '../../scripts/architecture/dependency/runtime-module-specifier.mts';

describe('runtime dependency cycles', () => {
    it('accepts an acyclic graph', () => {
        const graph = new Map([
            ['src/a.ts', ['src/b.ts', 'src/c.ts']],
            ['src/b.ts', ['src/c.ts']],
            ['src/c.ts', []],
        ]);

        expect(findDependencyCycles(graph)).toEqual([]);
    });

    it('reports a direct cycle from a stable starting module', () => {
        const graph = new Map([
            ['src/z.ts', ['src/a.ts']],
            ['src/a.ts', ['src/z.ts']],
        ]);

        expect(findDependencyCycles(graph)).toEqual([
            ['src/a.ts', 'src/z.ts', 'src/a.ts'],
        ]);
    });

    it('reports nested and self cycles deterministically', () => {
        const graph = new Map([
            ['src/a.ts', ['src/b.ts']],
            ['src/b.ts', ['src/c.ts']],
            ['src/c.ts', ['src/a.ts']],
            ['src/self.ts', ['src/self.ts']],
        ]);

        expect(findDependencyCycles(graph)).toEqual([
            ['src/a.ts', 'src/b.ts', 'src/c.ts', 'src/a.ts'],
            ['src/self.ts', 'src/self.ts'],
        ]);
    });

    it.each([
        ['import type { Shape } from \'./shape.js\';', []],
        ['import { type Shape } from \'./shape.js\';', []],
        ['export type { Shape } from \'./shape.js\';', []],
        ['export { type Shape } from \'./shape.js\';', []],
        ['import { type Shape, value } from \'./shape.js\';', ['./shape.js']],
        ['export { type Shape, value } from \'./shape.js\';', ['./shape.js']],
        ['import \'./register.js\';', ['./register.js']],
        ['export * from \'./values.js\';', ['./values.js']],
    ])('classifies runtime edges in %s', (source, expected) => {
        const sourceFile = ts.createSourceFile(
            'module.ts',
            source,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TS,
        );

        expect(sourceFile.statements
            .map(runtimeModuleSpecifier)
            .filter((specifier): specifier is string => specifier !== undefined))
            .toEqual(expected);
    });
});
