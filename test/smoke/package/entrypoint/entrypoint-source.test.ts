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
            2_739,
            '5aa180307e0b4ce6e501a92f9840442e7ccb554fd5cab125baf8a1c53e31e87c',
        ],
        [
            'CommonJS',
            commonJsEntrypointSmoke,
            2_417,
            '3bc520ff13d38ac4cf5275cf3125883c8af08e9e2ceea22be9b919caf3faa7a3',
        ],
    ])('keeps the %s program byte-identical', (_format, source, bytes, sha256) => {
        expect(Buffer.byteLength(source)).toBe(bytes);
        expect(createHash('sha256').update(source).digest('hex')).toBe(sha256);
    });
});
