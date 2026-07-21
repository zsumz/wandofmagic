import type { MissingPolicy } from '../../core/plan/operation-options.js';
import type {
    Path as StrictPath,
    PathInput,
} from '../../core/path/path.js';
import type { NormalizedPathInput } from '../path/input.js';
import type { PathTypeOperation } from './operation.js';

/** Append a deferred output-type operation without materializing the current object. */
export type AppendPathTypeOperation<
    Program extends readonly PathTypeOperation[],
    Operation extends PathTypeOperation,
> = readonly [...Program, Operation];

/** Append one deferred constant path write. */
export type AppendSetPathTypeOperation<
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
    Replacement,
> = AppendPathTypeOperation<Program, {
    readonly kind: 'add';
    readonly path: OperationPath;
    readonly replacement: Replacement;
}>;

/** Append a deferred path transform using its missing-value guarantee. */
export type AppendTransformPathTypeOperation<
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
    Replacement,
    Policy extends MissingPolicy,
> = AppendPathTypeOperation<Program, {
    readonly kind: Policy extends 'skip' ? 'replace' : 'require';
    readonly path: OperationPath;
    readonly replacement: Replacement;
}>;

/** Append an ordered tuple of tolerated path omissions. */
export type AppendOmitPathTypeOperations<
    Program extends readonly PathTypeOperation[],
    Paths extends readonly PathInput[],
> = Paths extends readonly [
    infer OperationPath extends PathInput,
    ...infer Rest extends readonly PathInput[],
]
    ? AppendOmitPathTypeOperations<
        AppendPathTypeOperation<Program, {
            readonly kind: 'omit';
            readonly path: NormalizedPathInput<OperationPath>;
        }>,
        Rest
    >
    : Program;

/** Append a move while preserving conditional no-op branches without expanding a union. */
export type AppendMovePathTypeOperations<
    Program extends readonly PathTypeOperation[],
    Source extends PathInput,
    Destination extends PathInput,
    Moved,
    Conditional extends boolean,
> = Conditional extends true
    ? AppendPathTypeOperation<
        AppendPathTypeOperation<Program, {
            readonly kind: 'optionalize';
            readonly path: NormalizedPathInput<Source>;
        }>,
        {
            readonly kind: 'optional-add';
            readonly path: NormalizedPathInput<Destination>;
            readonly replacement: Moved;
        }
    >
    : AppendSetPathTypeOperation<
        AppendPathTypeOperation<Program, {
            readonly kind: 'omit';
            readonly path: NormalizedPathInput<Source>;
        }>,
        NormalizedPathInput<Destination>,
        Moved
    >;
