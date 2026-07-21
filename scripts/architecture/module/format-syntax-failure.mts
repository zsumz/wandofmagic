import type ts from 'typescript';
import { relativePath } from './module-files.mts';

export function formatSyntaxFailure(
    root: string,
    file: string,
    sourceFile: ts.SourceFile,
    node: ts.Node,
    message: string,
): string {
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    return `${relativePath(root, file)}:${String(start.line + 1)}:${String(start.character + 1)} ${message}`;
}
