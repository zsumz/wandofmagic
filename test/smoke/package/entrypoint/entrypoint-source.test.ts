import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
    commonJsEntrypointSmoke,
} from '../../../../smoke/package/entrypoint/commonjs-smoke-source.mts';
import {
    esmEntrypointSmoke,
} from '../../../../smoke/package/entrypoint/esm-smoke-source.mts';

describe('package entrypoint smoke source', () => {
    it.each([
        [
            'ESM',
            esmEntrypointSmoke,
            2_602,
            'd0ff992bca10ce5b3d40a9f8d8dce8aad137f84c119c3e3282ac38a8e5cb82da',
        ],
        [
            'CommonJS',
            commonJsEntrypointSmoke,
            2_280,
            '6d6e53e0237648c3336e99ee1c3f4df50f901d564b39e2b2bb45e6be09c6f7c0',
        ],
    ])('keeps the %s program byte-identical', (_format, source, bytes, sha256) => {
        expect(Buffer.byteLength(source)).toBe(bytes);
        expect(createHash('sha256').update(source).digest('hex')).toBe(sha256);
    });
});
