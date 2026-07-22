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
            1_588,
            'c579a7772da8c0658f4327187ea5c544d367cffd50ae084346a3d9f06b842b5b',
        ],
        [
            'CommonJS',
            commonJsEntrypointSmoke,
            1_348,
            'b547784a1d4e47b4adb7cfb80a91969fb94e098cbf6d7ba8b9bc1c6597e78461',
        ],
    ])('keeps the %s program byte-identical', (_format, source, bytes, sha256) => {
        expect(Buffer.byteLength(source)).toBe(bytes);
        expect(createHash('sha256').update(source).digest('hex')).toBe(sha256);
    });
});
