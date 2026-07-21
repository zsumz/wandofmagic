import type { Path as StrictPath } from '../../core/path/path.js';
import type {
    MutatedPathArray,
    PathTail,
    ReplacePathProperty,
} from './shape.js';

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
