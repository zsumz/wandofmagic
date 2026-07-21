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
