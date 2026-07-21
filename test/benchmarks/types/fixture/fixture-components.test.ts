import { describe, expect, it } from 'vitest';
import {
    benchmarkModelSource,
} from '../../../../scripts/benchmarks/types/fixture/benchmark-model-source.mts';
import {
    chainDefinitionSource,
    chainOutputSource,
} from '../../../../scripts/benchmarks/types/fixture/chain-source.mts';
import {
    fixtureImportSource,
} from '../../../../scripts/benchmarks/types/fixture/fixture-import-source.mts';
import {
    createIndependentOperationSource,
} from '../../../../scripts/benchmarks/types/fixture/independent-operation-source.mts';
import {
    readTypeBenchmarkConfig,
} from '../../../../scripts/benchmarks/types/harness/type-benchmark-config.mts';

describe('type fixture source components', () => {
    it('selects builder imports independently from source assembly', () => {
        expect(fixtureImportSource(readTypeBenchmarkConfig({}))).toBe(`import { spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';
import type {
    AddAtPath,
    InferOutput,
    OmitAtPath,
    PathOf,
    ReplaceAtPath,
    RequireAtPath,
} from 'wandofmagic';`);
    });

    it('selects only the requested utility for program mode', () => {
        const config = readTypeBenchmarkConfig({
            WANDOFMAGIC_TYPE_CHAIN_MODE: 'program',
            WANDOFMAGIC_TYPE_OPERATION: 'omit',
        });

        expect(fixtureImportSource(config)).toBe(`import type {
    AppendPathTypeOperation,
    EvaluatePathTypeOperations,
} from 'wandofmagic/internal/path-program';

import type {
    OmitAtPath,
    PathOf,
} from 'wandofmagic';`);
    });

    it('emits one model field for every requested operation', () => {
        const source = benchmarkModelSource(2);

        expect(source).toContain('    field0?:');
        expect(source).toContain('    field1?:');
        expect(source).not.toContain('    field2?:');
        expect(source).toContain('    recursive?: RecursiveNode;');
    });

    it('emits named independent operations and tuple members together', () => {
        const config = readTypeBenchmarkConfig({ WANDOFMAGIC_TYPE_OPERATION: 'omit' });

        expect(createIndependentOperationSource(2, config)).toEqual({
            definitions: 'type Independent0 = OmitAtPath<BenchmarkModel, readonly [\'field0\']>;\n'
                + 'type Independent1 = OmitAtPath<BenchmarkModel, readonly [\'field1\', \'value\']>;',
            resultTypes: 'Independent0, Independent1',
        });
    });

    it.each([
        ['materialized', 'type Step0 = BenchmarkModel;', 'Step2'],
        ['program', 'type Step0 = readonly [];', 'EvaluatePathTypeOperations<BenchmarkModel, Step2>'],
    ])('emits %s chain boundaries', (mode, firstLine, output) => {
        const config = readTypeBenchmarkConfig({ WANDOFMAGIC_TYPE_CHAIN_MODE: mode });

        expect(chainDefinitionSource(2, config)).toContain(firstLine);
        expect(chainOutputSource(2, config)).toBe(output);
    });
});
