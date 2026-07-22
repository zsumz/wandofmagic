import { WandError } from '../../../../dist/index.js';
import type { DeepBenchmarkRunner } from './benchmark-types.mts';
import { createInvalidDeepInput } from '../scenario/corpus.mts';
import type { DeepBenchmarkCorpus } from '../scenario/model.mts';

export function assertDeepEquivalent(
    corpus: DeepBenchmarkCorpus,
    runners: readonly DeepBenchmarkRunner[],
): void {
    const trusted = requireRunner(runners, 'wandofmagic-deep-trusted');
    for (const input of corpus) {
        const expected = JSON.stringify(trusted.run(input));
        for (const runner of runners) {
            if (JSON.stringify(runner.run(input)) !== expected) {
                throw new Error(`The ${runner.name} runner diverged on a valid deep input.`);
            }
        }
    }

    const invalid = createInvalidDeepInput();
    const expectedFailure = captureFailure(() => trusted.run(invalid));
    for (const name of ['wandofmagic-deep-checked', 'wandofmagic-deep-generated']) {
        const runner = requireRunner(runners, name);
        if (captureFailure(() => runner.run(invalid)) !== expectedFailure) {
            throw new Error(`The ${name} runner diverged on an invalid deep input.`);
        }
    }
}

function requireRunner(
    runners: readonly DeepBenchmarkRunner[],
    name: string,
): DeepBenchmarkRunner {
    const runner = runners.find((candidate) => candidate.name === name);
    if (runner === undefined) {
        throw new Error(`Missing deep benchmark runner: ${name}.`);
    }
    return runner;
}

function captureFailure(run: () => object): string {
    try {
        run();
    } catch (error) {
        if (error instanceof WandError) {
            return JSON.stringify(error.toJSON());
        }
        throw error;
    }
    throw new Error('Expected the deep benchmark mapper to reject invalid input.');
}
