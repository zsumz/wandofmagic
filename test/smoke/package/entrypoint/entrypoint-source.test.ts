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
            2_619,
            'ac0f85fecf2b0d6709b833b93c37350c0b46d224f2759ad2229906e41978a6d6',
        ],
        [
            'CommonJS',
            commonJsEntrypointSmoke,
            2_297,
            '1e8d81858a7c93c1d9389b29fdfb21762f8c4f851acefc8dd628f7366c662ddd',
        ],
    ])('keeps the %s program byte-identical', (_format, source, bytes, sha256) => {
        expect(Buffer.byteLength(source)).toBe(bytes);
        expect(createHash('sha256').update(source).digest('hex')).toBe(sha256);
    });
});
