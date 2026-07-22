import type {
    CopyConflictPolicy,
    MissingPolicy,
} from '../../core/plan/operation-options.js';
import type { PathInput } from '../../core/path/path.js';
import type { AppendCopyPathTypeOperations } from '../path-program/append-operation.js';
import type { PathTypeOperation } from '../path-program/operation.js';
import type {
    BuilderMoveSourceInput,
    BuilderMoveValue,
} from './move-output.js';

export type BuilderCopySourceInput<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    Source extends PathInput,
> = BuilderMoveSourceInput<Current, Program, Source>;

export type BuilderCopyProgram<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    Source extends PathInput,
    Destination extends PathInput,
    Missing extends MissingPolicy,
    Conflict extends CopyConflictPolicy,
> = AppendCopyPathTypeOperations<
    Program,
    Destination,
    BuilderMoveValue<Current, Program, Source>,
    Missing extends 'skip' ? true : Conflict extends 'preserve' ? true : false
>;
