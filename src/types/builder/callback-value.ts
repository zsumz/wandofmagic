/** Expose callback inputs recursively as readonly without changing primitive values. */
export type ReadonlyCallbackValue<Value> = Value extends (...arguments_: never[]) => unknown
    ? Value
    : Value extends readonly unknown[]
        ? { readonly [Index in keyof Value]: ReadonlyCallbackValue<Value[Index]> }
        : Value extends object
            ? { readonly [Key in keyof Value]: ReadonlyCallbackValue<Value[Key]> }
            : Value;

/** Reject promise-like callback outputs from the synchronous execution core. */
export type SynchronousCallbackValue<Value> = Value extends PromiseLike<unknown> ? never : Value;
