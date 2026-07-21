import type { Path as StrictPath } from '../../core/path/path.js';
import type {
    MutatedPathArray,
    PathTail,
    RequirePathProperty,
} from './shape.js';

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
