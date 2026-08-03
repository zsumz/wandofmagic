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
            2_745,
            '23813373012cdc22a2eb5c8b1c866734860966138acdb6b4c2c1845badeb7d6f',
        ],
        [
            'CommonJS',
            commonJsEntrypointSmoke,
            2_423,
            '64b82593aa9e4f14c226b4b5a655627d40b01dbdfbde0f8ac057d6a14c22ddde',
        ],
    ])('keeps the %s program byte-identical', (_format, source, bytes, sha256) => {
        expect(Buffer.byteLength(source)).toBe(bytes);
        expect(createHash('sha256').update(source).digest('hex')).toBe(sha256);
    });
});
