import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { inspectPackageEntrypoints } from './contract/package-entrypoints.mts';
import { inspectTypePaths } from './contract/type-paths.mts';

export async function inspectPublicEntrypointContract(root: string): Promise<string[]> {
    const [packageJson, typeConfig] = await Promise.all([
        readJson(path.join(root, 'package.json')),
        readJson(path.join(root, 'tsconfig.types.json')),
    ]);
    return inspectPublicEntrypointValues(packageJson, typeConfig);
}

export function inspectPublicEntrypointValues(
    packageJson: unknown,
    typeConfig: unknown,
): string[] {
    return [
        ...inspectPackageEntrypoints(packageJson),
        ...inspectTypePaths(packageJson, typeConfig),
    ];
}

async function readJson(file: string): Promise<unknown> {
    return JSON.parse(await readFile(file, 'utf8')) as unknown;
}
