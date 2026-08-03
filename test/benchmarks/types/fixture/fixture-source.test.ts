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
        ['builder', 16_534, '8a077beaaed47fa4c1f293da0ce6ea999e8957a7a9fa60a4849d6c8131975118'],
        ['materialized', 6_213, '1785450a67faf425ce0f1e0f4d975d89c55de1b984500b03af26ca5ce0e38138'],
        ['program', 7_100, '11ac89ba4bf463356765125b2912c50da123ad21b55e918ae3ac2edaf02c6390'],
    ])('keeps the 10-operation %s fixture byte-identical', (mode, bytes, sha256) => {
        const source = createFixture(10, readTypeBenchmarkConfig({
            WANDOFMAGIC_TYPE_CHAIN_MODE: mode,
        }));

        expect(Buffer.byteLength(source)).toBe(bytes);
        expect(createHash('sha256').update(source).digest('hex')).toBe(sha256);
    });

    it('keeps the default 100-operation fixture byte-identical', () => {
        const source = createFixture(100, readTypeBenchmarkConfig({}));

        expect(Buffer.byteLength(source)).toBe(136_251);
        expect(createHash('sha256').update(source).digest('hex'))
            .toBe('74155cf6a835a27fa9a1ea0ac290c50573b7011fbba82e5892f1840fc9877d8a');
    });
});
