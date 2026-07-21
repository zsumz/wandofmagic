import path from 'node:path';
import { allowedSourceIndexes } from '../entrypoint/allowed-source-indexes.mts';

export const allowedRootTestModules = new Set(['test/integration.test.ts']);

export const allowedArchitectureRootModules = new Set([
    'scripts/architecture/check.mts',
]);

export const groupedTestDirectories = new Set([
    'test/operations',
    'test/operations/flat',
    'test/types',
]);

export const forbiddenModuleNames = new Set([
    'common.mts',
    'common.ts',
    'config.mts',
    'config.ts',
    'helpers.mts',
    'helpers.ts',
    'utils.mts',
    'utils.ts',
]);

export const moduleLineLimit = 150;

export function inspectModuleLayout(relative: string, lineCount: number): string[] {
    const failures: string[] = [];

    if (forbiddenModuleNames.has(path.posix.basename(relative))) {
        failures.push(`${relative}: generic junk-drawer module names are forbidden.`);
    }
    if (isUnapprovedSourceIndex(relative)) {
        failures.push(`${relative}: add public entrypoints deliberately and update the architecture contract.`);
    }
    if (isUnapprovedRootTest(relative)) {
        failures.push(`${relative}: feature tests belong in an owned test subdirectory.`);
    }
    if (isUngroupedArchitectureModule(relative)) {
        failures.push(
            `${relative}: architecture internals belong in an owned domain subdirectory.`,
        );
    }
    if (isUngroupedTestModule(relative)) {
        failures.push(`${relative}: tests in this domain belong in an owned subdirectory.`);
    }
    if (lineCount > moduleLineLimit) {
        failures.push(
            `${relative}: ${String(lineCount)} lines exceeds the ${String(moduleLineLimit)}-line limit.`,
        );
    }
    return failures;
}

export function isUngroupedTestModule(relative: string): boolean {
    return groupedTestDirectories.has(path.posix.dirname(relative));
}

export function isUngroupedArchitectureModule(relative: string): boolean {
    return path.posix.dirname(relative) === 'scripts/architecture'
        && !allowedArchitectureRootModules.has(relative);
}

function isUnapprovedSourceIndex(relative: string): boolean {
    return path.posix.basename(relative) === 'index.ts'
        && !allowedSourceIndexes.has(relative);
}

function isUnapprovedRootTest(relative: string): boolean {
    return path.posix.dirname(relative) === 'test'
        && !allowedRootTestModules.has(relative);
}
