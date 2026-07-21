import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import {
    inspectSourceSafety,
} from '../../scripts/architecture/module/source-safety.mts';
import {
    inspectSourceSyntax,
} from '../../scripts/architecture/module/inspect-source-syntax.mts';

const root = '/workspace';
const sourceRoot = `${root}/src`;
const sourceFile = `${sourceRoot}/core/value.ts`;

describe('source syntax safety', () => {
    it.each([
        [
            'type Value = any;',
            'src/core/value.ts:1:14 Explicit any is forbidden in source code.',
        ],
        [
            'const value = input!;',
            'src/core/value.ts:1:15 Non-null assertions are forbidden in source code.',
        ],
        [
            'const value = input as string;',
            'src/core/value.ts:1:15 Type assertions belong in src/internal/type-boundary/ '
                + 'unless an ADR documents an exception.',
        ],
        [
            'const value = <string>input;',
            'src/core/value.ts:1:15 Type assertions belong in src/internal/type-boundary/ '
                + 'unless an ADR documents an exception.',
        ],
    ])('rejects unsafe source in %s', (source, failure) => {
        expect(inspect(sourceFile, source)).toEqual([failure]);
    });

    it('allows const assertions', () => {
        expect(inspect(sourceFile, 'const value = input as const;')).toEqual([]);
    });

    it('allows assertions inside the explicit type boundary', () => {
        expect(inspect(
            `${sourceRoot}/internal/type-boundary/value.ts`,
            'const value = input as string;',
        )).toEqual([]);
    });

    it('combines import and safety inspection through one coordinator', () => {
        const file = `${sourceRoot}/runtime/value.ts`;
        const source = 'import type { Path } from \'../core/path.js\';\ntype Value = any;';
        const parsed = parse(file, source);

        expect(inspectSourceSyntax(root, sourceRoot, file, parsed)).toEqual([
            'src/runtime/value.ts:1:1 implementation modules must import the owner '
                + 'behind src/core/path.ts.',
            'src/runtime/value.ts:2:14 Explicit any is forbidden in source code.',
        ]);
    });
});

function inspect(file: string, source: string): string[] {
    return inspectSourceSafety(root, file, parse(file, source));
}

function parse(file: string, source: string): ts.SourceFile {
    return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}
