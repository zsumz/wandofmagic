import type { Path as StrictPath } from '../../core/path/path.js';
import type { PathTypeOperation } from '../path-program/operation.js';
import type { EvaluatePathTypeOperationsValue } from '../path-program/value.js';

export type PathOperationValue<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
> = Exclude<EvaluatePathTypeOperationsValue<Current, Program, OperationPath>, undefined>;

export type RawPathOperationValue<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
> = EvaluatePathTypeOperationsValue<Current, Program, OperationPath>;

export type CompatiblePathValue<Value, Accepted> = [Value] extends [never]
    ? never
    : [Value] extends [Accepted] ? unknown : never;
