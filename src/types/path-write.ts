import type { Path as StrictPath } from '../core/path.js';
import type {
    BuildPathShape,
    MutatedPathArray,
    PathTail,
    ReplacePathProperty,
    RequirePathProperty,
    SimplifyPath,
} from './path-shape.js';

type ReplacePathValue<Value, Path, Replacement> = Value extends null | undefined
    ? Value
    : Path extends readonly [infer Segment, ...infer Rest]
        ? Segment extends number
            ? Value extends readonly unknown[]
                ? MutatedPathArray<
                    Value,
                    ReplacePathValue<Value[number], PathTail<Rest>, Replacement>
                >
                : Value
            : Segment extends keyof Value
                ? Value extends object
                    ? ReplacePathProperty<
                        Value,
                        Segment,
                        ReplacePathValue<Value[Segment], PathTail<Rest>, Replacement>
                    >
                    : Value
                : Value
        : Replacement;

/** Replace a path while preserving optional parents and property modifiers. */
export type ReplaceAtPath<
    Value,
    Path extends StrictPath,
    Replacement,
> = ReplacePathValue<Value, Path, Replacement>;

type RequirePathValue<Value, Path, Replacement> = Value extends null | undefined
    ? never
    : Path extends readonly [infer Segment, ...infer Rest]
        ? Segment extends number
            ? Value extends readonly unknown[]
                ? MutatedPathArray<
                    Value,
                    RequirePathValue<Value[number], PathTail<Rest>, Replacement>
                >
                : never
            : Segment extends keyof Value
                ? Value extends object
                    ? RequirePathProperty<
                        Value,
                        Segment,
                        RequirePathValue<Value[Segment], PathTail<Rest>, Replacement>
                    >
                    : never
                : never
        : Replacement;

/** Replace an existing path and require every object parent on successful output. */
export type RequireAtPath<
    Value,
    Path extends StrictPath,
    Replacement,
> = RequirePathValue<Value, Path, Replacement>;

type AddObjectPath<
    Value extends object,
    Segment extends string,
    Rest,
    Replacement,
> = Segment extends keyof Value
    ? RequirePathProperty<
        Value,
        Segment,
        AddPathValue<Value[Segment], PathTail<Rest>, Replacement>
    >
    : SimplifyPath<Value & Record<Segment, BuildPathShape<PathTail<Rest>, Replacement>>>;

type AddPathValue<Value, Path, Replacement> = Value extends null
    ? never
    : Value extends undefined
        ? BuildPathShape<Path, Replacement>
        : Path extends readonly [infer Segment, ...infer Rest]
            ? Segment extends number
                ? Value extends readonly unknown[]
                    ? MutatedPathArray<
                        Value,
                        AddPathValue<Value[number], PathTail<Rest>, Replacement>
                    >
                    : never
                : Segment extends string
                    ? Value extends object
                        ? AddObjectPath<Value, Segment, Rest, Replacement>
                        : never
                    : never
            : Replacement;

/** Add or overwrite a path, constructing absent object or array parents in the output type. */
export type AddAtPath<
    Value,
    Path extends StrictPath,
    Replacement,
> = AddPathValue<Value, Path, Replacement>;
