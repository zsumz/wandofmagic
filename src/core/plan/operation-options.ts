/** Behavior when a field is absent or explicitly `undefined`. */
export type MissingPolicy = 'error' | 'skip';

/** Behavior when a move destination already has an own field. */
export type MoveConflictPolicy = 'error' | 'overwrite' | 'preserve';

/** Options common to all plan steps. */
export interface StepOptions {
    readonly id?: string;
}

/** Options for operations that read one field. */
export interface MissingOptions<Policy extends MissingPolicy = 'error'> extends StepOptions {
    readonly missing?: Policy;
}

/** Missing-source and occupied-destination policies for one move step. */
export interface MoveOptions<
    Missing extends MissingPolicy = 'error',
    Conflict extends MoveConflictPolicy = 'error',
> extends MissingOptions<Missing> {
    readonly conflict?: Conflict;
}
