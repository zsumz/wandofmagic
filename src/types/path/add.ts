import type { Path as StrictPath } from '../../core/path/path.js';
import type {
    BuildPathShape,
    MutatedPathArray,
    PathTail,
    RequirePathProperty,
    SimplifyPath,
} from './shape.js';

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
