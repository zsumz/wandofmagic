import type { Path as StrictPath } from '../../core/path/path.js';
import type { SafePathInput } from '../path/input.js';
import type { PathTypeOperation } from '../path-program/operation.js';
import type { AppendOmitPathTypeOperations } from '../path-program/append-operation.js';

export type BuilderPathOmitPaths = readonly [StrictPath, ...StrictPath[]];

type SafeOmitPathTuple<Paths extends readonly StrictPath[]> = Paths extends readonly [
    infer OperationPath extends StrictPath,
    ...infer Rest extends readonly StrictPath[],
]
    ? readonly [SafePathInput<OperationPath>, ...SafeOmitPathTuple<Rest>]
    : readonly [];

export type BuilderPathOmitInput<Paths extends BuilderPathOmitPaths> =
    SafeOmitPathTuple<Paths>;

export type BuilderPathOmitProgram<
    Program extends readonly PathTypeOperation[],
    Paths extends BuilderPathOmitPaths,
> = AppendOmitPathTypeOperations<Program, Paths>;
