import { readFile } from 'node:fs/promises';

import { releaseTagFailure } from './release-tag.mts';

const packageJson: unknown = JSON.parse(
    await readFile(new URL('../../package.json', import.meta.url), 'utf8'),
);
const version = readVersion(packageJson);
const releaseTag = process.env['RELEASE_TAG'] ?? '';
const failure = releaseTagFailure(version, releaseTag);

if (failure !== undefined) {
    console.error(failure);
    process.exitCode = 1;
}

function readVersion(value: unknown): string {
    if (
        typeof value !== 'object'
        || value === null
        || !('version' in value)
        || typeof value.version !== 'string'
    ) {
        throw new TypeError('package.json must contain a string version.');
    }
    return value.version;
}
