import type ts from 'typescript';
import { inspectSourceImports } from './source-import-boundaries.mts';
import { inspectSourceSafety } from './source-safety.mts';

export function inspectSourceSyntax(
    root: string,
    sourceRoot: string,
    file: string,
    sourceFile: ts.SourceFile,
): string[] {
    return [
        ...inspectSourceImports(root, sourceRoot, file, sourceFile),
        ...inspectSourceSafety(root, file, sourceFile),
    ];
}
