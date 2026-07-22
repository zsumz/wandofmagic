/** Cross the checked collection boundary after the runtime has inspected an own data property. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The item spell selects the checked input type.
export function castCollectionItem<Input extends object>(value: unknown): Input {
    return value as Input;
}

/** Expose a runtime-owned sparse array through the collection spell's output type. */
export function castCollectionOutput<Output extends object>(value: unknown[]): Output[] {
    return value as Output[];
}
