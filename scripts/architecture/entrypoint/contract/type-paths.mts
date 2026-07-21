import {
    packageSpecifier,
    publicEntrypoints,
} from '../../../shared/public-entrypoints.mts';
import {
    compareContractValue,
    readNestedProperty,
    readProperty,
} from './value-comparison.mts';

export function inspectTypePaths(packageJson: unknown, typeConfig: unknown): string[] {
    const failures: string[] = [];
    const packageName = readProperty(packageJson, 'name');
    const expectedPaths = typeof packageName === 'string'
        ? Object.fromEntries(publicEntrypoints.map((entrypoint) => [
            packageSpecifier(packageName, entrypoint.packageSubpath),
            [`./${entrypoint.sourcePath}`],
        ]))
        : undefined;

    compareContractValue(
        failures,
        readNestedProperty(typeConfig, ['compilerOptions', 'paths']),
        expectedPaths,
        'tsconfig.types.json paths do not match the public entrypoint manifest.',
    );
    return failures;
}
