import type { SpellOptions } from './spell-options.js';
import type { SpellDescription, StepDescription } from './description-types.js';

function freezeStepDescription(description: StepDescription): StepDescription {
    return Object.freeze({
        ...description,
        reads: Object.freeze([...description.reads]),
        removes: Object.freeze([...description.removes]),
        writes: Object.freeze([...description.writes]),
    });
}

/** Create an immutable public description without retaining mutable plan metadata. */
export function createSpellDescription(
    metadata: SpellOptions,
    steps: readonly StepDescription[],
): SpellDescription {
    return Object.freeze({
        ...metadata.name === undefined ? {} : { name: metadata.name },
        steps: Object.freeze(steps.map(freezeStepDescription)),
        ...metadata.version === undefined ? {} : { version: metadata.version },
    });
}
