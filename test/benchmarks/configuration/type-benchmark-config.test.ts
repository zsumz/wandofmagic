import { describe, expect, it } from 'vitest';
import {
    readTypeBenchmarkConfig,
} from '../../../scripts/benchmarks/types/harness/type-benchmark-config.mts';

describe('type benchmark configuration', () => {
    it('reads stable defaults from an empty environment', () => {
        const config = readTypeBenchmarkConfig({});

        expect(config).toMatchObject({
            builderOperation: 'mixed',
            chainMode: 'builder',
            checkBudgetMilliseconds: 5_000,
            operationCounts: [10, 25, 50, 100],
            selectedDepth: undefined,
            selectedOperation: undefined,
            sequentialChainLimit: 100,
        });
        expect(config.compilerPath).toBe(`${config.root}node_modules/typescript/bin/tsc`);
        expect(Object.isFrozen(config)).toBe(true);
        expect(Object.isFrozen(config.operationCounts)).toBe(true);
    });

    it('reads every supported environment override', () => {
        expect(readTypeBenchmarkConfig({
            WANDOFMAGIC_TYPE_BUDGET_MS: '9000',
            WANDOFMAGIC_TYPE_BUILDER_OPERATION: 'transform',
            WANDOFMAGIC_TYPE_CHAIN_LIMIT: '50',
            WANDOFMAGIC_TYPE_CHAIN_MODE: 'program',
            WANDOFMAGIC_TYPE_DEPTH: '4',
            WANDOFMAGIC_TYPE_OPERATION: 'omit',
        })).toMatchObject({
            builderOperation: 'transform',
            chainMode: 'program',
            checkBudgetMilliseconds: 9_000,
            selectedDepth: 4,
            selectedOperation: 3,
            sequentialChainLimit: 50,
        });
    });

    it.each([
        ['WANDOFMAGIC_TYPE_BUILDER_OPERATION', 'rename', 'must be coerce'],
        ['WANDOFMAGIC_TYPE_CHAIN_MODE', 'flat', 'must be builder'],
        ['WANDOFMAGIC_TYPE_DEPTH', '9', 'must be an integer from 1 through 8'],
        ['WANDOFMAGIC_TYPE_OPERATION', 'move', 'must be replace'],
    ])('rejects invalid %s selections', (name, value, message) => {
        expect(() => readTypeBenchmarkConfig({ [name]: value })).toThrow(message);
    });
});
