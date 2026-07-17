import type { Path as StrictPath } from '../core/path.js';
import type {
    BuildPathShape,
    MutatedPathArray,
    PathTail,
    ReplacePathProperty,
    SimplifyPath,
} from './path-shape.js';

type OptionalPathProperty<Value extends object, Key extends keyof Value, Next> = SimplifyPath<
    Omit<Value, Key> & { [Property in keyof Pick<Value, Key>]?: Next }
>;

type OptionalizePathValue<Value, Path> = Value extends null | undefined
    ? Value
    : Path extends readonly [infer Segment, ...infer Rest]
        ? Segment extends number
            ? Value extends readonly unknown[]
                ? MutatedPathArray<
                    Value,
                    OptionalizePathValue<Value[number], PathTail<Rest>>
                >
                : Value
            : Segment extends keyof Value
                ? Value extends object
                    ? Rest extends readonly []
                        ? OptionalPathProperty<Value, Segment, Value[Segment]>
                        : ReplacePathProperty<
                            Value,
                            Segment,
                            OptionalizePathValue<Value[Segment], PathTail<Rest>>
                        >
                    : Value
                : Value
        : Value;

/** Preserve a tolerated source path while allowing its leaf to be absent. */
export type OptionalizeAtPath<Value, Path extends StrictPath> =
    OptionalizePathValue<Value, Path>;

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
