import type { BenchmarkInput } from './benchmark-types.mts';
import { captureMapperOutcome } from './capture-mapper-outcome.mts';
import type { GeneratedMapper } from '../mappers/generated-mapper.mts';
import { runHandwrittenEquivalent } from '../mappers/handwritten/equivalent-mapper.mts';
import { normalize, trustedDiscard } from '../scenario/wandofmagic-spell.mts';

export function assertEquivalentOutcome(
    input: object,
    generatedMapper: GeneratedMapper,
): void {
    const expected = captureMapperOutcome(() =>
        normalize.run(input as BenchmarkInput, trustedDiscard));
    const candidates = [
        ['semantics-equivalent handwritten', runHandwrittenEquivalent],
        ['generated', generatedMapper],
    ] as const;

    for (const [name, mapper] of candidates) {
        const actual = captureMapperOutcome(() => mapper(input as BenchmarkInput));
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`The ${name} mapper diverged from Wandofmagic.`);
        }
    }
}
