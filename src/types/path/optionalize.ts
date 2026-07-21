import type { Path as StrictPath } from '../../core/path/path.js';
import type {
    MutatedPathArray,
    PathTail,
    ReplacePathProperty,
    SimplifyPath,
} from './shape.js';

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
