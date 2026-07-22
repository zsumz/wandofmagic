import type {
    Path as StrictPath,
    PathSegment,
} from '../../core/path/path.js';
import type {
    PathTail,
    RebuildPathArray,
    ReplacePathProperty,
    SimplifyPath,
} from './shape.js';

type PickObjectPath<
    Value extends object,
    Segment extends keyof Value,
    Rest,
> = Rest extends readonly []
    ? Pick<Value, Segment>
    : ReplacePathProperty<
        Pick<Value, Segment>,
        Segment,
        PickPathValue<Value[Segment], PathTail<Rest>>
    >;

type PickPathValue<Value, Segments extends readonly PathSegment[]> = Value extends null | undefined
    ? Value
    : Segments extends readonly [infer Segment, ...infer Rest]
        ? Segment extends number
            ? Value extends readonly unknown[]
                ? RebuildPathArray<Value, PickPathValue<Value[number], PathTail<Rest>>>
                : never
            : Segment extends keyof Value
                ? Value extends object
                    ? PickObjectPath<Value, Segment, Rest>
                    : never
                : never
        : Value;

type PickPathUnion<Value, Paths extends readonly StrictPath[]> = Paths[number] extends infer Path
    ? Path extends StrictPath ? PickAtPath<Value, Path> : never
    : never;

type UnionToIntersection<Value> =
    (Value extends unknown ? (value: Value) => void : never) extends
    (value: infer Intersection) => void ? Intersection : never;

/** Retain one path and the containers required to reach it. */
export type PickAtPath<Value, OperationPath extends StrictPath> =
    PickPathValue<Value, OperationPath>;

/** Retain a non-empty set of paths and merge their selected output shapes. */
export type PickAtPaths<Value, Paths extends readonly StrictPath[]> = SimplifyPath<
    UnionToIntersection<PickPathUnion<Value, Paths>>
>;
