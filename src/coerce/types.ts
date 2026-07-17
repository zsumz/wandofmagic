declare const coercerInput: unique symbol;
declare const coercerOutput: unique symbol;

export interface CoerceSuccess<Output> {
    readonly ok: true;
    readonly value: Output;
}

export interface CoerceFailure {
    readonly code?: string;
    readonly message: string;
    readonly ok: false;
}

export type CoerceResult<Output> = CoerceFailure | CoerceSuccess<Output>;

/** A named, deterministic, fallible value conversion. */
export interface Coercer<Input, Output> {
    readonly [coercerInput]?: Input;
    readonly [coercerOutput]?: Output;
    readonly name: string;
    readonly run: (value: unknown) => CoerceResult<Output>;
}

type CoercerParts<Value> = Value extends Coercer<infer Input, infer Output>
    ? readonly [input: Input, output: Output]
    : readonly [input: never, output: never];

export type CoercerInput<Value> = CoercerParts<Value>[0];
export type CoercerOutput<Value> = CoercerParts<Value>[1];

export interface CoercerDefinition<Output> {
    readonly name: string;
    readonly run: (value: unknown) => CoerceResult<Output>;
}

const validCoercerName = /^[a-z0-9][a-z0-9._/-]*$/i;

/** Define a custom coercer while keeping its accepted input type available to the builder. */
export function defineCoercer<Input, Output>(
    definition: CoercerDefinition<Output>,
): Coercer<Input, Output> {
    if (!validCoercerName.test(definition.name)) {
        throw new TypeError(
            'Coercer names must begin with an alphanumeric character and contain only letters, numbers, ., _, /, or -.',
        );
    }

    return Object.freeze({
        name: definition.name,
        run: definition.run,
    });
}
