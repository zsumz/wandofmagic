import type { Path as StrictPath } from '../../core/path/path.js';
import type {
    BuildPathShape,
    MutatedPathArray,
    PathTail,
    ReplacePathProperty,
    SimplifyPath,
} from './shape.js';

/** Construct an optional object branch for a move that may become a no-op. */
export type BuildOptionalPathShape<Path, Leaf> = Path extends readonly []
    ? Leaf
    : Path extends readonly [infer Segment, ...infer Rest]
        ? Segment extends string
            ? { [Property in Segment]?: BuildOptionalPathShape<Rest, Leaf> }
            : Segment extends number
                ? Array<BuildOptionalPathShape<Rest, Leaf>>
                : never
        : never;

type OptionalAddObjectPath<
    Value extends object,
    Segment extends string,
    Rest,
    Replacement,
> = Segment extends keyof Value
    ? ReplacePathProperty<
        Value,
        Segment,
        OptionalAddPathValue<Value[Segment], PathTail<Rest>, Replacement>
    >
    : SimplifyPath<Value & Partial<Record<
        Segment,
        BuildOptionalPathShape<PathTail<Rest>, Replacement>
    >>>;

type OptionalAddPathValue<Value, Path, Replacement> = Path extends readonly []
    ? Value | Replacement
    : Value extends null
        ? Value
        : Value extends undefined
            ? Value | BuildPathShape<Path, Replacement>
            : Path extends readonly [infer Segment, ...infer Rest]
                ? Segment extends number
                    ? Value extends readonly unknown[]
                        ? MutatedPathArray<
                            Value,
                            OptionalAddPathValue<Value[number], PathTail<Rest>, Replacement>
                        >
                        : Value
                    : Segment extends string
                        ? Value extends object
                            ? OptionalAddObjectPath<Value, Segment, Rest, Replacement>
                            : Value
                        : Value
                : Value;

/** Add a destination that is only present on one successful conditional-move branch. */
export type OptionalAddAtPath<
    Value,
    Path extends StrictPath,
    Replacement,
> = OptionalAddPathValue<Value, Path, Replacement>;
