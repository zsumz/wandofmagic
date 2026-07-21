import type { BenchmarkInput } from './benchmark-types.mts';
import type { GeneratedMapper } from '../mappers/generated-mapper.mts';
import { assertEquivalentOutcome } from './assert-equivalent-outcome.mts';
import { createEquivalenceInputs } from './equivalence-inputs.mts';

export function assertEquivalent(
    corpus: readonly BenchmarkInput[],
    generatedMapper: GeneratedMapper,
): void {
    for (const input of createEquivalenceInputs(corpus)) {
        assertEquivalentOutcome(input, generatedMapper);
    }
}
