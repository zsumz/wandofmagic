import type { Coercer, CoercerInput, CoercerOutput } from '../coerce/types.js';
import type { MissingPolicy, MoveConflictPolicy } from '../core/options.js';
import type { Path as StrictPath, PathInput } from '../core/path.js';
import type { NormalizedPathInput, SafePathInput } from './path-input.js';
import type { PathTypeOperation } from './path-program-operation.js';
import type {
    AppendOmitPathTypeOperations,
    AppendMovePathTypeOperations,
    AppendSetPathTypeOperation,
    AppendTransformPathTypeOperation,
} from './path-program.js';
import type { EvaluatePathTypeOperationsValue } from './path-program-value.js';

type PathOperationValue<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
> = Exclude<EvaluatePathTypeOperationsValue<Current, Program, OperationPath>, undefined>;

type RawPathOperationValue<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
> = EvaluatePathTypeOperationsValue<Current, Program, OperationPath>;

export type BuilderMoveValue<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    Source extends PathInput,
> = Exclude<RawPathOperationValue<
    Current, Program, NormalizedPathInput<Source>
>, undefined>;

export type BuilderMoveSourceInput<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    Source extends PathInput,
> = Source
    & SafePathInput<NoInfer<Source>>
    & ([BuilderMoveValue<Current, Program, Source>] extends [never] ? never : unknown);

export type BuilderMoveProgram<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    Source extends PathInput,
    Destination extends PathInput,
    Missing extends MissingPolicy,
    Conflict extends MoveConflictPolicy,
> = AppendMovePathTypeOperations<
    Program,
    Source,
    Destination,
    BuilderMoveValue<Current, Program, Source>,
    Missing extends 'skip' ? true : Conflict extends 'preserve' ? true : false
>;

type CompatiblePathValue<Value, Accepted> = [Value] extends [never]
    ? never
    : [Value] extends [Accepted] ? unknown : never;

export type BuilderPathOmitPaths = readonly [StrictPath, ...StrictPath[]];

type SafeOmitPathTuple<Paths extends readonly StrictPath[]> = Paths extends readonly [
    infer OperationPath extends StrictPath,
    ...infer Rest extends readonly StrictPath[],
]
    ? readonly [SafePathInput<OperationPath>, ...SafeOmitPathTuple<Rest>]
    : readonly [];

export type BuilderPathOmitInput<
    Paths extends BuilderPathOmitPaths,
> = SafeOmitPathTuple<Paths>;

export type BuilderPathOmitProgram<
    Program extends readonly PathTypeOperation[],
    Paths extends BuilderPathOmitPaths,
> = AppendOmitPathTypeOperations<Program, Paths>;

export type BuilderSetProgram<
    Program extends readonly PathTypeOperation[],
    OperationPath extends PathInput,
    Replacement,
> = AppendSetPathTypeOperation<Program, NormalizedPathInput<OperationPath>, Replacement>;

export type BuilderPathDefaultGuard<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
    Fallback,
    Defined = Exclude<RawPathOperationValue<Current, Program, OperationPath>, undefined>,
> = [Defined] extends [never] ? unknown : [Fallback] extends [Defined] ? unknown : never;

export type BuilderPathDefaultProgram<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
    Fallback,
> = AppendSetPathTypeOperation<
    Program,
    OperationPath,
    Exclude<RawPathOperationValue<Current, Program, OperationPath>, undefined> | Fallback
>;

export type BuilderPathTransformValue<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
> = PathOperationValue<Current, Program, OperationPath>;

export type BuilderPathTransformInput<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
> = OperationPath
    & SafePathInput<NoInfer<OperationPath>>
    & ([BuilderPathTransformValue<Current, Program, OperationPath>] extends [never]
        ? never
        : unknown);

export type BuilderPathTransformProgram<
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
    Replacement,
    Policy extends MissingPolicy,
> = AppendTransformPathTypeOperation<Program, OperationPath, Replacement, Policy>;

export type BuilderPathCoerceInput<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
    CoercerValue extends Coercer<unknown, unknown>,
> = OperationPath
    & SafePathInput<NoInfer<OperationPath>>
    & CompatiblePathValue<
        PathOperationValue<Current, Program, OperationPath>,
        CoercerInput<CoercerValue>
    >;

export type BuilderPathCoerceProgram<
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
    CoercerValue extends Coercer<unknown, unknown>,
    Policy extends MissingPolicy,
> = AppendTransformPathTypeOperation<
    Program, OperationPath, CoercerOutput<CoercerValue>, Policy
>;
