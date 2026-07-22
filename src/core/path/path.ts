/** A path segment used in issues, receipts, and future deep-path APIs. */
export type PathSegment = string | number;

/** A normalized non-empty path rooted at a record field. */
export type FieldPath = readonly [string, ...PathSegment[]];

/** A public diagnostic path rooted at either a record field or collection index. */
export type DataPath = readonly [PathSegment, ...PathSegment[]];

/** A strict record-rooted operation path within the shared eight-segment budget. */
export type Path =
    | readonly [string, PathSegment, PathSegment, PathSegment, PathSegment, PathSegment, PathSegment, PathSegment]
    | readonly [string, PathSegment, PathSegment, PathSegment, PathSegment, PathSegment, PathSegment]
    | readonly [string, PathSegment, PathSegment, PathSegment, PathSegment, PathSegment]
    | readonly [string, PathSegment, PathSegment, PathSegment, PathSegment]
    | readonly [string, PathSegment, PathSegment, PathSegment]
    | readonly [string, PathSegment, PathSegment]
    | readonly [string, PathSegment]
    | readonly [string];

/** Top-level shorthand or a strict deep tuple accepted by path-aware operations. */
export type PathInput = string | Path;

/** Maximum strict path depth supported by both runtime and type utilities. */
export const pathDepthLimit = 8;

/** Create an immutable top-level path for public diagnostics. */
export function fieldPath(key: string): FieldPath {
    const path: [string] = [key];
    return Object.freeze(path);
}
