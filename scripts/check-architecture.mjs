import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'src');
const failures = [];
const warnings = [];
const allowedIndexes = new Set([
    'src/coerce/index.ts',
    'src/compiler/index.ts',
    'src/index.ts',
]);
const forbiddenNames = new Set(['common.ts', 'helpers.ts', 'utils.ts']);
const forbiddenLayerImports = {
    coerce: new Set(['builder', 'core', 'internal', 'operations', 'runtime', 'types']),
    compiler: new Set(['builder', 'coerce', 'operations', 'types']),
    core: new Set(['builder', 'coerce', 'internal', 'operations', 'runtime', 'types']),
    instructions: new Set(['builder', 'coerce', 'core', 'internal', 'operations', 'runtime', 'types']),
    operations: new Set(['builder', 'operations']),
    runtime: new Set(['builder', 'operations']),
    types: new Set(['builder', 'operations', 'runtime']),
};

async function collectTypeScriptFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await collectTypeScriptFiles(absolute)));
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
            files.push(absolute);
        }
    }

    return files;
}

function relative(file) {
    return path.relative(root, file).split(path.sep).join('/');
}

function sourceLayer(file) {
    return relative(file).split('/')[1];
}

function importLayer(file, specifier) {
    if (!specifier.startsWith('.')) {
        return undefined;
    }

    const target = path.resolve(path.dirname(file), specifier.replace(/\.js$/u, '.ts'));
    if (!target.startsWith(`${sourceRoot}${path.sep}`)) {
        return undefined;
    }

    return sourceLayer(target);
}

function report(file, node, sourceFile, message) {
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    failures.push(`${relative(file)}:${start.line + 1}:${start.character + 1} ${message}`);
}

function isTypeBoundary(file) {
    const rel = relative(file);
    return rel === 'src/internal/type-boundary.ts' ||
        rel.startsWith('src/internal/type-boundary/');
}

function inspectSyntax(file, sourceFile) {
    const layer = sourceLayer(file);

    function visit(node) {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
            const targetLayer = importLayer(file, node.moduleSpecifier.text);
            if (targetLayer !== undefined && forbiddenLayerImports[layer]?.has(targetLayer)) {
                report(
                    file,
                    node,
                    sourceFile,
                    `${layer} modules must not import the ${targetLayer} layer.`,
                );
            }
        }

        if (node.kind === ts.SyntaxKind.AnyKeyword) {
            report(file, node, sourceFile, 'Explicit any is forbidden in source code.');
        }

        if (ts.isNonNullExpression(node)) {
            report(file, node, sourceFile, 'Non-null assertions are forbidden in source code.');
        }

        if (
            (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) &&
            !isTypeBoundary(file) &&
            node.type.getText(sourceFile) !== 'const'
        ) {
            report(
                file,
                node,
                sourceFile,
                'Type assertions belong in src/internal/type-boundary unless an ADR documents an exception.',
            );
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
}

const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
if (Object.keys(packageJson.dependencies ?? {}).length > 0) {
    failures.push('package.json: runtime dependencies require an accepted design decision.');
}

const files = await collectTypeScriptFiles(sourceRoot);
for (const file of files) {
    const source = await readFile(file, 'utf8');
    const rel = relative(file);
    const lineCount = source.split(/\r?\n/u).length;

    if (forbiddenNames.has(path.basename(file))) {
        failures.push(`${rel}: generic junk-drawer module names are forbidden.`);
    }
    if (path.basename(file) === 'index.ts' && !allowedIndexes.has(rel)) {
        failures.push(
            `${rel}: add public entrypoints deliberately and update the architecture contract.`,
        );
    }
    if (lineCount > 250) {
        failures.push(`${rel}: ${lineCount} lines exceeds the 250-line hard limit.`);
    } else if (lineCount > 150) {
        warnings.push(`${rel}: ${lineCount} lines exceeds the 150-line soft limit.`);
    }

    const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
    );
    inspectSyntax(file, sourceFile);
}

for (const warning of warnings) {
    console.warn(`architecture warning: ${warning}`);
}

if (failures.length > 0) {
    console.error('Architecture guardrails failed:\n');
    for (const failure of failures) {
        console.error(`- ${failure}`);
    }
    process.exitCode = 1;
} else {
    console.log(`Architecture guardrails passed for ${files.length} source modules.`);
}
