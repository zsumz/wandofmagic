import type {
    Path as StrictPath,
    PathSegment,
} from '../../core/path/path.js';

type ValueAtSegment<Value, Segment extends PathSegment> = Value extends null | undefined
    ? undefined
    : Value extends ReadonlyArray<infer Item>
        ? Segment extends number
            ? Item | undefined
            : never
        : Segment extends keyof Value
            ? Value[Segment]
            : never;

type ValueAtPath<Value, Path extends readonly PathSegment[]> =
    Path extends readonly [infer Segment, ...infer Rest]
        ? Segment extends PathSegment
            ? Rest extends readonly PathSegment[]
                ? ValueAtPath<ValueAtSegment<Value, Segment>, Rest>
                : never
            : never
        : Value;

/** Resolve an already validated path tail that may begin with an array index. */
export type PathValueAtSegments<
    Value,
    Segments extends readonly PathSegment[],
> = ValueAtPath<Value, Segments>;

/** Resolve the value observed at a strict path, including optional parents and sparse indices. */
export type PathValue<Value, Path extends StrictPath> = ValueAtPath<Value, Path>;
