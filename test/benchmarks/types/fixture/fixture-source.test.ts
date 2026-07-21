import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
    createFixture,
} from '../../../../scripts/benchmarks/types/fixture/create-fixture.mts';
import {
    readTypeBenchmarkConfig,
} from '../../../../scripts/benchmarks/types/harness/type-benchmark-config.mts';

describe('type benchmark fixture source', () => {
    it.each([
        ['builder', 16_528, 'c5319e84efa59d60652d366415f7ebfa64a2f73ec0bf0f98e7a743a8fb5b4ce5'],
        ['materialized', 6_211, 'eac8cab4910dbaff6a758781cd8abba9abbc57ac7cb8dc0d378c2c2c5e880408'],
        ['program', 7_096, 'f682b5b0e47e96f2d7f634ae8a0b7235cf6e3a47939f4bb9b0428503a641332c'],
    ])('keeps the 10-operation %s fixture byte-identical', (mode, bytes, sha256) => {
        const source = createFixture(10, readTypeBenchmarkConfig({
            WANDOFMAGIC_TYPE_CHAIN_MODE: mode,
        }));

        expect(Buffer.byteLength(source)).toBe(bytes);
        expect(createHash('sha256').update(source).digest('hex')).toBe(sha256);
    });

    it('keeps the default 100-operation fixture byte-identical', () => {
        const source = createFixture(100, readTypeBenchmarkConfig({}));

        expect(Buffer.byteLength(source)).toBe(136_245);
        expect(createHash('sha256').update(source).digest('hex'))
            .toBe('24b845313f5aabc2a54560b91b9c26b3a4ff46be6abe327ef2e738ec3266cef4');
    });
});
