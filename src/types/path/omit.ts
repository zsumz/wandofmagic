import type { Path as StrictPath } from '../../core/path/path.js';
import type {
    MutatedPathArray,
    PathTail,
    ReplacePathProperty,
    SimplifyPath,
} from './shape.js';

type OmitObjectPath<Value extends object, Segment extends keyof Value, Rest> =
    Rest extends readonly []
        ? SimplifyPath<Omit<Value, Segment>>
        : ReplacePathProperty<
            Value,
            Segment,
            OmitPathValue<Value[Segment], PathTail<Rest>>
        >;

type OmitArrayPath<Value extends readonly unknown[], Rest> = Rest extends readonly []
    ? Value
    : MutatedPathArray<Value, OmitPathValue<Value[number], PathTail<Rest>>>;

type OmitPathValue<Value, Path> = Value extends null | undefined
    ? Value
    : Path extends readonly [infer Segment, ...infer Rest]
        ? Segment extends number
            ? Value extends readonly unknown[]
                ? OmitArrayPath<Value, Rest>
                : never
            : Segment extends keyof Value
                ? Value extends object
                    ? OmitObjectPath<Value, Segment, Rest>
                    : never
                : Value
        : Value;

/** Remove an object field at a path while preserving tolerated missing parents. */
export type OmitAtPath<Value, Path extends StrictPath> = OmitPathValue<Value, Path>;
