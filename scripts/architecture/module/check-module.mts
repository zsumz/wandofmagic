import { readFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { inspectSourceSyntax } from './inspect-source-syntax.mts';
import { inspectModuleLayout } from './module-layout.mts';
import { relativePath } from './module-files.mts';
import {
    facadeDirectories,
    isPureReExportFacade,
} from './source-facades.mts';
import { inspectTestSyntax } from './test-import-boundaries.mts';

export interface ModuleInspection {
    readonly failures: readonly string[];
}

export async function checkModule(
    root: string,
    sourceRoot: string,
    file: string,
): Promise<ModuleInspection> {
    const source = await readFile(file, 'utf8');
    const relative = relativePath(root, file);
    const lineCount = source.split(/\r?\n/u).length;
    const failures = inspectModuleLayout(relative, lineCount);

    if (relative.startsWith('src/') || relative.startsWith('test/')) {
        const sourceFile = ts.createSourceFile(
            file,
            source,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TS,
        );
        if (relative.startsWith('src/')) {
            if (
                facadeDirectories.has(path.posix.dirname(relative))
                && !isPureReExportFacade(sourceFile)
            ) {
                failures.push(
                    `${relative}: root modules at this boundary must be pure re-export facades.`,
                );
            }
            failures.push(...inspectSourceSyntax(root, sourceRoot, file, sourceFile));
        } else {
            failures.push(...inspectTestSyntax(root, sourceRoot, file, sourceFile));
        }
    }
    return { failures };
}
