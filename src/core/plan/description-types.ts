import type { FieldPath } from '../path/path.js';
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
