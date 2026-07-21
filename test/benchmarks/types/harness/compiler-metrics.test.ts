import { describe, expect, it } from 'vitest';
import {
    readCompilerMetrics,
} from '../../../../scripts/benchmarks/types/harness/compiler-metrics.mts';

const diagnostics = [
    'Types:                         50364',
    'Instantiations:                152076',
    'Memory used:                   121329K',
    'Check time:                    0.53s',
].join('\r\n');

describe('TypeScript compiler metrics', () => {
    it('reads and normalizes extended diagnostics', () => {
        expect(readCompilerMetrics(diagnostics, 10, 750.6)).toEqual({
            checkMilliseconds: 530,
            instantiations: 152_076,
            memoryKilobytes: 121_329,
            operations: 10,
            types: 50_364,
            wallMilliseconds: 751,
        });
    });

    it.each([
        'Check time',
        'Instantiations',
        'Memory used',
        'Types',
    ])('reports a missing %s metric', (label) => {
        const output = diagnostics.split('\r\n')
            .filter((line) => !line.startsWith(`${label}:`))
            .join('\n');

        expect(() => readCompilerMetrics(output, 10, 750))
            .toThrow(`TypeScript did not report the ${label} metric.`);
    });
});
