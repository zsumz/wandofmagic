export interface PublicEntrypoint {
    readonly buildName: string;
    readonly packageSubpath: string;
    readonly sourcePath: string;
}

export const publicEntrypoints: readonly PublicEntrypoint[] = Object.freeze([
    Object.freeze({
        buildName: 'coerce',
        packageSubpath: './coerce',
        sourcePath: 'src/coerce/index.ts',
    }),
    Object.freeze({
        buildName: 'compiler',
        packageSubpath: './compiler',
        sourcePath: 'src/compiler/index.ts',
    }),
    Object.freeze({
        buildName: 'index',
        packageSubpath: '.',
        sourcePath: 'src/index.ts',
    }),
]);

export function findPublicEntrypoint(packageSubpath: string): PublicEntrypoint {
    const entrypoint = publicEntrypoints.find(
        (candidate) => candidate.packageSubpath === packageSubpath,
    );
    if (entrypoint === undefined) {
        throw new TypeError(`Unknown public package subpath: ${packageSubpath}`);
    }
    return entrypoint;
}

export function packageSpecifier(packageName: string, packageSubpath: string): string {
    return packageSubpath === '.'
        ? packageName
        : `${packageName}${packageSubpath.slice(1)}`;
}
