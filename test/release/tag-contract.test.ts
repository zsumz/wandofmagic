import { describe, expect, it } from 'vitest';

import { releaseTagFailure } from '../../scripts/release/release-tag.mjs';

describe('alpha release tag contract', () => {
    it('accepts an exact prerelease version tag', () => {
        expect(releaseTagFailure('0.1.0-alpha.0', 'v0.1.0-alpha.0')).toBeUndefined();
    });

    it('rejects a tag that does not match package.json', () => {
        expect(releaseTagFailure('0.1.0-alpha.0', 'v0.1.0-alpha.1')).toContain(
            'Release tag must be v0.1.0-alpha.0',
        );
    });

    it('rejects stable package versions', () => {
        expect(releaseTagFailure('1.0.0', 'v1.0.0')).toContain(
            'requires a prerelease package version',
        );
    });
});
