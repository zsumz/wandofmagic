import type { WandResult } from '../../../../dist/index.js';
import type { BenchmarkInput, BenchmarkOutput } from '../harness/benchmark-types.mts';
import { checkedDiscard, normalize, trustedDiscard } from '../scenario/wandofmagic-spell.mts';

export function runWandofmagicCheckedCollect(input: BenchmarkInput): BenchmarkOutput {
    return unwrap(normalize.safeRun(input));
}

export function runWandofmagicCheckedDiscard(input: BenchmarkInput): BenchmarkOutput {
    return unwrap(normalize.safeRun(input, checkedDiscard));
}

export function runWandofmagicChecked(input: BenchmarkInput): BenchmarkOutput {
    return normalize.run(input, checkedDiscard);
}

export function runWandofmagicTrusted(input: BenchmarkInput): BenchmarkOutput {
    return normalize.run(input, trustedDiscard);
}

function unwrap(result: WandResult<object>): BenchmarkOutput {
    if (!result.ok) {
        throw new Error(result.issues[0]?.message ?? 'Benchmark execution failed.');
    }
    return result.value as BenchmarkOutput;
}
