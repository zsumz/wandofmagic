import type { Coercer, CoercerInput, CoercerOutput } from '../../coerce/types.js';
import type { MissingPolicy } from '../../core/plan/operation-options.js';
import type { Path as StrictPath } from '../../core/path/path.js';
import type { SafePathInput } from '../path/input.js';
import type { PathTypeOperation } from '../path-program/operation.js';
import type { AppendTransformPathTypeOperation } from '../path-program/append-operation.js';
import type { CompatiblePathValue, PathOperationValue } from './path-value.js';

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
    Program,
    OperationPath,
    CoercerOutput<CoercerValue>,
    Policy
>;
