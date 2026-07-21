import { describe, expect, it } from 'vitest';
import { parseWorkerResult } from '../../../../scripts/benchmarks/flat/harness/worker-process.mts';

describe('flat benchmark worker result', () => {
    it('accepts a complete result', () => {
        const result = {
            name: 'wandofmagic-generated',
            results: [{ fieldCount: 10, opsPerSecond: 123_456 }],
        };

        expect(parseWorkerResult(JSON.stringify(result))).toEqual(result);
    });

    it.each([
        {},
        { name: 7, results: [] },
        { name: 'wandofmagic-generated', results: {} },
        { name: 'wandofmagic-generated', results: [{ fieldCount: 0, opsPerSecond: 10 }] },
        { name: 'wandofmagic-generated', results: [{ fieldCount: 10, opsPerSecond: null }] },
    ])('rejects malformed worker output %#', (result) => {
        expect(() => parseWorkerResult(JSON.stringify(result))).toThrow(
            'A flat benchmark worker returned an invalid result.',
        );
    });
});
