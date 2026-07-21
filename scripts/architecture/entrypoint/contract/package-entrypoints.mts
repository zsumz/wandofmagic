import {
    findPublicEntrypoint,
    publicEntrypoints,
} from '../../../shared/public-entrypoints.mts';
import {
    compareContractValue,
    readProperty,
} from './value-comparison.mts';

export function inspectPackageEntrypoints(packageJson: unknown): string[] {
    const failures: string[] = [];
    const rootEntrypoint = findPublicEntrypoint('.');

    compareContractValue(
        failures,
        readProperty(packageJson, 'exports'),
        Object.fromEntries(publicEntrypoints.map((entrypoint) => [
            entrypoint.packageSubpath,
            expectedConditionalExport(entrypoint.buildName),
        ])),
        'package.json exports do not match the public entrypoint manifest.',
    );
    compareContractValue(
        failures,
        readProperty(packageJson, 'typesVersions'),
        {
            '*': Object.fromEntries(publicEntrypoints
                .filter(({ packageSubpath }) => packageSubpath !== '.')
                .map(({ buildName, packageSubpath }) => [
                    packageSubpath.slice(2),
                    [`dist/${buildName}.d.ts`],
                ])),
        },
        'package.json typesVersions do not match the public entrypoint manifest.',
    );
    compareContractValue(
        failures,
        {
            main: readProperty(packageJson, 'main'),
            module: readProperty(packageJson, 'module'),
            types: readProperty(packageJson, 'types'),
        },
        {
            main: `./dist/${rootEntrypoint.buildName}.cjs`,
            module: `./dist/${rootEntrypoint.buildName}.js`,
            types: `./dist/${rootEntrypoint.buildName}.d.ts`,
        },
        'package.json root entrypoints do not match the public entrypoint manifest.',
    );
    return failures;
}

function expectedConditionalExport(buildName: string): object {
    return {
        import: {
            types: `./dist/${buildName}.d.ts`,
            default: `./dist/${buildName}.js`,
        },
        require: {
            types: `./dist/${buildName}.d.cts`,
            default: `./dist/${buildName}.cjs`,
        },
    };
}
