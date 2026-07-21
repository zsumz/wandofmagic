import type { PathTypeOperation } from '../../path-program/operation.js';
import type { EvaluatePathTypeOperations } from '../../path-program/evaluate-program.js';

export type BuilderOutput<
    Current extends object,
    Program extends readonly PathTypeOperation[],
> = EvaluatePathTypeOperations<Current, Program>;
