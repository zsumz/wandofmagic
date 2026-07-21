import { describe, expect, it } from 'vitest';
import {
    materializedOperationSource,
} from '../../../../scripts/benchmarks/types/fixture/path-operation/materialized-operation-source.mts';
import {
    programOperationSource,
} from '../../../../scripts/benchmarks/types/fixture/path-operation/program-operation-source.mts';
import {
    pathOperationUtility,
    selectPathOperation,
} from '../../../../scripts/benchmarks/types/fixture/path-operation/select-path-operation.mts';
import {
    readTypeBenchmarkConfig,
} from '../../../../scripts/benchmarks/types/harness/type-benchmark-config.mts';

describe('path operation source', () => {
    const config = readTypeBenchmarkConfig({});

    it.each([
        [
            0,
            'type Output = ReplaceAtPath<Input, readonly [\'field0\'], number>;',
            'type Output = AppendPathTypeOperation<Input, '
                + '{ readonly kind: \'replace\'; readonly path: readonly [\'field0\']; '
                + 'readonly replacement: number }>;',
        ],
        [
            1,
            'type Output = RequireAtPath<Input, readonly [\'field1\', \'value\'], number>;',
            'type Output = AppendPathTypeOperation<Input, '
                + '{ readonly kind: \'require\'; readonly path: '
                + 'readonly [\'field1\', \'value\']; readonly replacement: number }>;',
        ],
        [
            2,
            'type Output = AddAtPath<Input, '
                + 'readonly [\'field2\', \'level2\', \'added\'], number>;',
            'type Output = AppendPathTypeOperation<Input, '
                + '{ readonly kind: \'add\'; readonly path: '
                + 'readonly [\'field2\', \'level2\', \'added\']; '
                + 'readonly replacement: number }>;',
        ],
        [
            3,
            'type Output = OmitAtPath<Input, '
                + 'readonly [\'field3\', \'level2\', \'level3\', \'value\']>;',
            'type Output = AppendPathTypeOperation<Input, '
                + '{ readonly kind: \'omit\'; readonly path: '
                + 'readonly [\'field3\', \'level2\', \'level3\', \'value\'] }>;',
        ],
    ])('emits mixed operation variant %#', (index, materialized, program) => {
        expect(materializedOperationSource('Input', 'Output', index, config))
            .toBe(materialized);
        expect(programOperationSource('Input', 'Output', index, config)).toBe(program);
    });

    it('uses selected operation and depth overrides', () => {
        const selected = readTypeBenchmarkConfig({
            WANDOFMAGIC_TYPE_DEPTH: '3',
            WANDOFMAGIC_TYPE_OPERATION: 'add',
        });

        expect(selectPathOperation(7, selected)).toEqual({
            kind: 'add',
            path: 'readonly [\'field7\', \'level2\', \'added\']',
            utility: 'AddAtPath',
            writesValue: true,
        });
    });

    it('omits replacement source for a selected omit operation', () => {
        const selected = readTypeBenchmarkConfig({
            WANDOFMAGIC_TYPE_DEPTH: '2',
            WANDOFMAGIC_TYPE_OPERATION: 'omit',
        });

        expect(materializedOperationSource('Input', 'Output', 0, selected)).toBe(
            'type Output = OmitAtPath<Input, readonly [\'field0\', \'value\']>;',
        );
        expect(programOperationSource('Input', 'Output', 0, selected)).not
            .toContain('replacement');
    });

    it.each([
        [0, 'ReplaceAtPath'],
        [1, 'RequireAtPath'],
        [2, 'AddAtPath'],
        [3, 'OmitAtPath'],
    ] as const)('maps operation %i to %s', (operation, utility) => {
        expect(pathOperationUtility(operation)).toBe(utility);
    });
});
