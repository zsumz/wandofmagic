import type { DeepBenchmarkMapper } from '../scenario/model.mts';
import type { DeepBenchmarkRunner } from './benchmark-types.mts';
import { createDeepBenchmarkRunner } from './benchmark-runner.mts';
import { runHandwrittenDeepHappy } from '../mappers/handwritten-happy.mts';
import {
    runWandofmagicDeepChecked,
    runWandofmagicDeepTrusted,
} from '../mappers/wandofmagic-mappers.mts';

export function createDeepRunnerCatalog(
    generated: DeepBenchmarkMapper | undefined,
): readonly DeepBenchmarkRunner[] {
    return Object.freeze([
        createDeepBenchmarkRunner('handwritten-deep-happy', runHandwrittenDeepHappy),
        createDeepBenchmarkRunner('wandofmagic-deep-checked', runWandofmagicDeepChecked),
        createDeepBenchmarkRunner('wandofmagic-deep-trusted', runWandofmagicDeepTrusted),
        createDeepBenchmarkRunner('wandofmagic-deep-generated', requireGenerated(generated)),
    ]);
}

function requireGenerated(generated: DeepBenchmarkMapper | undefined): DeepBenchmarkMapper {
    return (input) => {
        if (generated === undefined) {
            throw new Error('The generated deep benchmark mapper was not initialized.');
        }
        return generated(input);
    };
}
