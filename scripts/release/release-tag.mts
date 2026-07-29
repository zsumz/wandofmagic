export function releaseTagFailure(version: string, releaseTag: string): string | undefined {
    if (!version.includes('-')) {
        return `Alpha publishing requires a prerelease package version; received ${version}.`;
    }
    const expectedTag = `v${version}`;
    if (releaseTag !== expectedTag) {
        return `Release tag must be ${expectedTag}; received ${releaseTag || '(empty)'}.`;
    }
    return undefined;
}
