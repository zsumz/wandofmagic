import ts from 'typescript';
import { allowedSourceIndexes } from '../entrypoint/allowed-source-indexes.mts';
import { relativePath } from './module-files.mts';
import { isRootFacadeModule } from './source-facades.mts';
import { resolveImportedSourceModule } from './source-module-target.mts';

export function inspectTestSyntax(
    root: string,
    sourceRoot: string,
    file: string,
    sourceFile: ts.SourceFile,
): string[] {
    const failures: string[] = [];
    for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
            continue;
        }
        const target = resolveImportedSourceModule(
            sourceRoot,
            file,
            statement.moduleSpecifier.text,
        );
        if (
            target === undefined
            || !isRootFacadeModule(root, target)
            || allowedSourceIndexes.has(relativePath(root, target))
        ) {
            continue;
        }
        const start = sourceFile.getLineAndCharacterOfPosition(statement.getStart(sourceFile));
        failures.push(
            `${relativePath(root, file)}:${String(start.line + 1)}:${String(start.character + 1)} `
            + `tests must import the owner behind ${relativePath(root, target)}.`,
        );
    }
    return failures;
}
