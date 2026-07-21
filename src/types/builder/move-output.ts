import type {
    MissingPolicy,
    MoveConflictPolicy,
} from '../../core/plan/operation-options.js';
import type { PathInput } from '../../core/path/path.js';
import type {
    NormalizedPathInput,
    SafePathInput,
} from '../path/input.js';
import type { PathTypeOperation } from '../path-program/operation.js';
import type { AppendMovePathTypeOperations } from '../path-program/append-operation.js';
import type { RawPathOperationValue } from './path-value.js';

export type BuilderMoveValue<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    Source extends PathInput,
> = Exclude<RawPathOperationValue<
    Current,
    Program,
    NormalizedPathInput<Source>
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
