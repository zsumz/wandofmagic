import type {
    Path as StrictPath,
    PathInput,
} from '../../core/path/path.js';
import type { NormalizedPathInput } from '../path/input.js';
import type { PathTypeOperation } from '../path-program/operation.js';
import type { AppendSetPathTypeOperation } from '../path-program/append-operation.js';
import type { RawPathOperationValue } from './path-value.js';

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
