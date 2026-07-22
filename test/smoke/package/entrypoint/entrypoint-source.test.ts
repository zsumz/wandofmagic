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
            1_806,
            '4ad9ef126520beb297c0f4cd155aa0b70f87d340b1d49bb49af29e748afb2b7d',
        ],
        [
            'CommonJS',
            commonJsEntrypointSmoke,
            1_471,
            '213cf268f43d2f3457d78dee8282f3ace9d08d6047687929410c6036022a7b60',
        ],
    ])('keeps the %s program byte-identical', (_format, source, bytes, sha256) => {
        expect(Buffer.byteLength(source)).toBe(bytes);
        expect(createHash('sha256').update(source).digest('hex')).toBe(sha256);
    });
});
