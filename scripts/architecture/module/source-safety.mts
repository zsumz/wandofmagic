import ts from 'typescript';
import { formatSyntaxFailure } from './format-syntax-failure.mts';
import { relativePath } from './module-files.mts';

export function inspectSourceSafety(
    root: string,
    file: string,
    sourceFile: ts.SourceFile,
): string[] {
    const failures: string[] = [];

    function report(node: ts.Node, message: string): void {
        failures.push(formatSyntaxFailure(root, file, sourceFile, node, message));
    }

    function visit(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.AnyKeyword) {
            report(node, 'Explicit any is forbidden in source code.');
        }
        if (ts.isNonNullExpression(node)) {
            report(node, 'Non-null assertions are forbidden in source code.');
        }
        if (isForbiddenTypeAssertion(root, file, node, sourceFile)) {
            report(
                node,
                'Type assertions belong in src/internal/type-boundary/ unless an ADR documents an exception.',
            );
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return failures;
}

function isForbiddenTypeAssertion(
    root: string,
    file: string,
    node: ts.Node,
    sourceFile: ts.SourceFile,
): boolean {
    return (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node))
        && !relativePath(root, file).startsWith('src/internal/type-boundary/')
        && node.type.getText(sourceFile) !== 'const';
}
