import type { SpellOptions } from './options.js';
import type { FieldPath } from './path.js';
import type { StepKind } from './step-kind.js';

/** A stable, value-free description of one compiled transformation step. */
export interface StepDescription {
    readonly id: string;
    readonly kind: StepKind;
    readonly reads: readonly FieldPath[];
    readonly removes: readonly FieldPath[];
    readonly writes: readonly FieldPath[];
}

/** Static metadata for a compiled spell. */
export interface SpellDescription {
    readonly name?: string;
    readonly steps: readonly StepDescription[];
    readonly version?: number;
}

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
