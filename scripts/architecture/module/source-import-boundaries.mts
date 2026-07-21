import ts from 'typescript';
import { allowedSourceIndexes } from '../entrypoint/allowed-source-indexes.mts';
import { formatSyntaxFailure } from './format-syntax-failure.mts';
import { forbiddenLayerImports } from './layer-import-policy.mts';
import { relativePath } from './module-files.mts';
import { isRootFacadeModule } from './source-facades.mts';
import { resolveImportedSourceModule } from './source-module-target.mts';

export function inspectSourceImports(
    root: string,
    sourceRoot: string,
    file: string,
    sourceFile: ts.SourceFile,
): string[] {
    const failures: string[] = [];
    const layer = sourceLayer(root, file);

    for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
            continue;
        }
        const target = resolveImportedSourceModule(
            sourceRoot,
            file,
            statement.moduleSpecifier.text,
        );
        const targetLayer = target === undefined ? undefined : sourceLayer(root, target);
        if (
            target !== undefined
            && isRootFacadeModule(root, target)
            && !allowedSourceIndexes.has(relativePath(root, file))
        ) {
            failures.push(formatSyntaxFailure(
                root,
                file,
                sourceFile,
                statement,
                `implementation modules must import the owner behind ${relativePath(root, target)}.`,
            ));
        }
        if (
            target !== undefined
            && targetLayer !== undefined
            && forbiddenLayerImports[layer]?.has(targetLayer)
            && !isSameOperationFeature(root, file, target)
        ) {
            failures.push(formatSyntaxFailure(
                root,
                file,
                sourceFile,
                statement,
                `${layer} modules must not import the ${targetLayer} layer.`,
            ));
        }
    }
    return failures;
}

function sourceLayer(root: string, file: string): string {
    return relativePath(root, file).split('/')[1] ?? '';
}

function isSameOperationFeature(root: string, source: string, target: string): boolean {
    const sourceFeature = operationFeature(root, source);
    return sourceFeature !== undefined && sourceFeature === operationFeature(root, target);
}

function operationFeature(root: string, file: string): string | undefined {
    const segments = relativePath(root, file).split('/');
    if (segments[0] !== 'src' || segments[1] !== 'operations') {
        return undefined;
    }
    const feature = segments.slice(2, -1).join('/');
    return feature.length === 0 ? undefined : feature;
}
