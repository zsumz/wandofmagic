import type {
    DeepBenchmarkInput,
    DeepBenchmarkOutput,
} from '../scenario/model.mts';
import {
    checkedDiscard,
    deepSpell,
    trustedDiscard,
} from '../scenario/deep-spell.mts';

export function runWandofmagicDeepChecked(input: DeepBenchmarkInput): DeepBenchmarkOutput {
    return deepSpell.run(input, checkedDiscard);
}

export function runWandofmagicDeepTrusted(input: DeepBenchmarkInput): DeepBenchmarkOutput {
    return deepSpell.run(input, trustedDiscard);
}
