import { describe, expect, it } from 'vitest';
import { createRunnerCatalog } from '../../../../scripts/benchmarks/flat/harness/create-runner-catalog.mts';

describe('flat benchmark runner catalog', () => {
    it('keeps runner names and report order stable', () => {
        expect(createRunnerCatalog(undefined).map(({ name }) => name)).toEqual([
            'handwritten-for-in-happy',
            'handwritten-object-keys-happy',
            'handwritten-equivalent',
            'handwritten-spread-historical',
            'wandofmagic-checked-collect',
            'wandofmagic-checked-discard',
            'wandofmagic-checked-run',
            'wandofmagic-trusted-run',
            'wandofmagic-generated',
        ]);
    });
});
