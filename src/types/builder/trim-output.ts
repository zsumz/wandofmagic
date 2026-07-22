import type { Path as StrictPath } from '../../core/path/path.js';
import type { SafePathInput } from '../path/input.js';
import type { PathTypeOperation } from '../path-program/operation.js';
import type { CompatiblePathValue, PathOperationValue } from './path-value.js';

export type BuilderPathTrimPaths = readonly [StrictPath, ...StrictPath[]];

type BuilderPathTrimPath<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
> = OperationPath
    & SafePathInput<OperationPath>
    & CompatiblePathValue<
        PathOperationValue<Current, Program, OperationPath>,
        string | null
    >;

export type BuilderPathTrimInput<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    Paths extends readonly StrictPath[],
> = Paths extends readonly [
    infer OperationPath extends StrictPath,
    ...infer Rest extends readonly StrictPath[],
]
    ? readonly [
        BuilderPathTrimPath<Current, Program, OperationPath>,
        ...BuilderPathTrimInput<Current, Program, Rest>,
    ]
    : readonly [];
