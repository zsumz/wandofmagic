import type { Path as StrictPath, PathSegment } from '../core/path.js';
import type { StringKeyOf } from './keys.js';

/** Supported recursion budgets for strict path inference. */
export type PathDepth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface PreviousDepth {
    0: 0;
    1: 0;
    2: 1;
    3: 2;
    4: 3;
    5: 4;
    6: 5;
    7: 6;
    8: 7;
};

type OpaqueObject =
    | ArrayBufferView
    | Date
    | Map<unknown, unknown>
    | Promise<unknown>
    | RegExp
    | Set<unknown>
    | WeakMap<object, unknown>
    | WeakSet<object>;

type Prefix<Segment extends PathSegment, Tail> = Tail extends readonly PathSegment[]
    ? readonly [Segment, ...Tail]
    : never;

type NestedPath<Value, Depth extends keyof PreviousDepth> = Depth extends 0
    ? never
    : NonNullable<Value> extends OpaqueObject | ((...arguments_: never[]) => unknown)
        ? never
        : NonNullable<Value> extends ReadonlyArray<infer Item>
            ? readonly [number] | Prefix<number, NestedPath<Item, PreviousDepth[Depth]>>
            : NonNullable<Value> extends object
                ? {
                    [Key in StringKeyOf<NonNullable<Value>>]:
                        | readonly [Key]
                        | Prefix<Key, NestedPath<NonNullable<Value>[Key], PreviousDepth[Depth]>>;
                }[StringKeyOf<NonNullable<Value>>]
                : never;

/** Enumerate strict record-rooted paths up to an explicit depth budget. */
export type PathOf<Value extends object, Depth extends PathDepth = 8> =
    Value extends readonly unknown[] ? never : NestedPath<Value, Depth>;

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
