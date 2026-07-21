import { describe, expect, it } from 'vitest';
import {
    builderOperationSource,
} from '../../../../scripts/benchmarks/types/fixture/builder-operation/builder-operation-source.mts';
import {
    builderSharedCoerceOperationSource,
    builderSharedDefaultOperationSource,
    builderSharedOmitOperationSource,
    builderSharedTransformOperationSource,
} from '../../../../scripts/benchmarks/types/fixture/builder-operation/shared-operation-source.mts';
import {
    readTypeBenchmarkConfig,
} from '../../../../scripts/benchmarks/types/harness/type-benchmark-config.mts';

describe('builder operation source', () => {
    it('cycles through every operation in mixed mode', () => {
        const config = readTypeBenchmarkConfig({});

        expect(Array.from({ length: 6 }, (_, index) =>
            builderOperationSource(index, config))).toEqual([
            '    .set([\'added0\'] as const, 0)',
            '    .default([\'field1\', \'added\'] as const, \'fallback1\')',
            '    .transform([\'field2\', \'level2\', \'value\'] as const, '
                + '(value) => String(value).length + 2)',
            '    .coerce([\'field3\', \'level2\', \'level3\', \'value\'] as const, number())',
            '    .omit([[\'field4\', \'level2\', \'level3\', \'level4\', \'value\'] as const])',
            '    .move([\'field5\', \'level2\', \'level3\', \'level4\', \'level5\', \'value\'] as const, '
                + '[\'field5\', \'level2\', \'level3\', \'level4\', \'level5\', \'moved\'] as const, '
                + '{ conflict: \'preserve\' })',
        ]);
    });

    it.each([
        ['set', '    .set([\'field0\', \'added\'] as const, 0)'],
        ['default', '    .default([\'field0\', \'added\'] as const, \'fallback0\')'],
        [
            'transform',
            '    .transform([\'field0\', \'value\'] as const, (value) => String(value).length + 0)',
        ],
        ['coerce', '    .coerce([\'field0\', \'value\'] as const, number())'],
        ['omit', '    .omit([[\'field0\', \'value\'] as const])'],
        [
            'move',
            '    .move([\'field0\', \'value\'] as const, [\'field0\', \'moved\'] as const)',
        ],
    ])('emits a selected %s operation', (operation, expected) => {
        const config = readTypeBenchmarkConfig({
            WANDOFMAGIC_TYPE_BUILDER_OPERATION: operation,
            WANDOFMAGIC_TYPE_DEPTH: '2',
        });

        expect(builderOperationSource(0, config)).toBe(expected);
    });

    it.each([
        [0, ''],
        [1, ', { conflict: \'overwrite\', missing: \'skip\' }'],
        [2, ', { conflict: \'preserve\' }'],
    ])('emits move option variant %#', (index, options) => {
        const config = readTypeBenchmarkConfig({
            WANDOFMAGIC_TYPE_BUILDER_OPERATION: 'move',
            WANDOFMAGIC_TYPE_DEPTH: '1',
        });
        const source = `['field${String(index)}']`;
        const destination = `['moved${String(index)}']`;

        expect(builderOperationSource(index, config))
            .toBe(`    .move(${source} as const, ${destination} as const${options})`);
    });
});

describe('shared builder operation source', () => {
    const config = readTypeBenchmarkConfig({ WANDOFMAGIC_TYPE_DEPTH: '2' });

    it('emits transform and coercion missing-policy variants', () => {
        expect(builderSharedTransformOperationSource(3, true, config)).toBe(
            '    .transform([\'field0\', \'value\'] as const, '
            + '(value) => String(value).length + 3, { missing: \'skip\' })',
        );
        expect(builderSharedCoerceOperationSource(true, config)).toBe(
            '    .coerce([\'field0\', \'value\'] as const, number(), { missing: \'skip\' })',
        );
    });

    it('emits default and omit operations', () => {
        expect(builderSharedDefaultOperationSource(config)).toBe(
            '    .default([\'field0\', \'value\'] as const, \'fallback\')',
        );
        expect(builderSharedOmitOperationSource(config)).toBe(
            '    .omit([[\'field0\', \'value\'] as const])',
        );
    });
});
