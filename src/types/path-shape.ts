import type { PathSegment } from '../core/path.js';

/** Normalize an object type for readable public hovers. */
export type SimplifyPath<Value> = { [Key in keyof Value]: Value[Key] } & {};

/** Preserve mutable versus readonly array shape while replacing its item model. */
export type RebuildPathArray<Value extends readonly unknown[], Item> = Value extends unknown[]
    ? Item[]
    : readonly Item[];

/** An exact index mutation leaves every other homogeneous-array item unchanged. */
export type MutatedPathArray<Value extends readonly unknown[], Modified> = RebuildPathArray<
    Value,
    Value[number] | Modified
>;

/** Replace one property while preserving its optional and readonly modifiers. */
export type ReplacePathProperty<Value extends object, Key extends keyof Value, Next> =
    SimplifyPath<{
        [Property in keyof Value]: Property extends Key ? Next : Value[Property];
    }>;

/** Replace one property and guarantee it exists while preserving readonly. */
export type RequirePathProperty<Value extends object, Key extends keyof Value, Next> =
    SimplifyPath<
        Omit<Value, Key> & { [Property in keyof Pick<Value, Key>]-?: Next }
    >;

/** Construct the container shape needed for a previously absent path. */
export type BuildPathShape<Path, Leaf> = Path extends readonly []
    ? Leaf
    : Path extends readonly [infer Segment, ...infer Rest]
        ? Segment extends string
            ? { [Property in Segment]: BuildPathShape<Rest, Leaf> }
            : Segment extends number
                ? Array<BuildPathShape<Rest, Leaf>>
                : never
        : never;

/** Narrow an inferred tuple tail back to the runtime path model. */
export type PathTail<Tail> = Tail extends readonly PathSegment[] ? Tail : never;
