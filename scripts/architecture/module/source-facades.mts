import path from 'node:path';
import ts from 'typescript';
import { relativePath } from './module-files.mts';

export const facadeDirectories = new Set([
    'src/builder',
    'src/compiler',
    'src/core',
    'src/instructions',
    'src/internal',
    'src/runtime',
    'src/types',
]);

export function isRootFacadeModule(root: string, file: string): boolean {
    return facadeDirectories.has(path.posix.dirname(relativePath(root, file)));
}

export function isPureReExportFacade(sourceFile: ts.SourceFile): boolean {
    return sourceFile.statements.length > 0
        && sourceFile.statements.every((statement) =>
            ts.isExportDeclaration(statement) && statement.moduleSpecifier !== undefined);
}
