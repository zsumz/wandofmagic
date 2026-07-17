/** Behavior when a field is absent or explicitly `undefined`. */
export type MissingPolicy = 'error' | 'skip';

/** Behavior when a move destination already has an own field. */
export type MoveConflictPolicy = 'error' | 'overwrite' | 'preserve';

/** Controls whether execution validates the input record or trusts a caller-supplied fast-path contract. */
export type InputPolicy = 'checked' | 'trusted';

/** Controls whether execution records privacy-safe change receipts. */
export type ReceiptPolicy = 'collect' | 'discard';

/** Options for one safe execution of a compiled spell. */
export interface RunOptions {
    /**
     * Inspect descriptors and reject accessors and enumerable symbols by default. Use `trusted`
     * only for plain records with own enumerable string data properties, no accessors, no proxies,
     * no enumerable symbols, and no inherited enumerable properties. Violating that contract can
     * execute user code or copy inherited fields.
     */
    readonly input?: InputPolicy;

    /**
     * Collect applied changes by default. Use `discard` to suppress receipt creation while keeping
     * transformation and issue behavior unchanged.
     */
    readonly receipt?: ReceiptPolicy;
}

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

/** Optional metadata attached to a reusable spell. */
export interface SpellOptions {
    readonly name?: string;
    readonly version?: number;
}
