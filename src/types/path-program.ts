import type { MissingPolicy } from '../core/options.js';
import type { Path as StrictPath, PathInput } from '../core/path.js';
import type { CompilePathTypeOperations } from './path-program-state.js';
import type { PathTypeOperation } from './path-program-operation.js';
import type { NormalizedPathInput } from './path-input.js';
import type { OptionalAddAtPath, OptionalizeAtPath } from './path-conditional.js';
import type { OmitAtPath } from './path-omit.js';
import type { AddAtPath, ReplaceAtPath, RequireAtPath } from './path-write.js';

export type { PathTypeOperation } from './path-program-operation.js';

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

/** Resolve a deferred path program once at an output boundary. */
export type EvaluatePathTypeOperations<
    Value,
    Program extends readonly PathTypeOperation[],
> = UniformSinglePathOperation<Program> extends infer Operation
    ? [Operation] extends [never]
        ? CompilePathTypeOperations<Value, Program>
        : Operation extends PathTypeOperation
            ? ApplySinglePathOperation<Value, Operation>
            : never
    : never;

type LastPathTypeOperation<Program extends readonly PathTypeOperation[]> =
    Program extends readonly [...readonly PathTypeOperation[], infer Last extends PathTypeOperation]
        ? Last
        : never;

type UniformSinglePathOperation<
    Program extends readonly PathTypeOperation[],
    Last extends PathTypeOperation = LastPathTypeOperation<Program>,
> = Last extends { readonly kind: 'add' | 'omit' | 'replace' | 'require' }
    ? Program[number] extends { readonly kind: Last['kind']; readonly path: Last['path'] }
        ? Last
        : never
    : never;

type ApplySinglePathOperation<Value, Operation extends PathTypeOperation> =
    Operation extends {
        readonly kind: 'add';
        readonly path: infer OperationPath extends StrictPath;
        readonly replacement: infer Replacement;
    }
        ? AddAtPath<Value, OperationPath, Replacement>
        : Operation extends {
            readonly kind: 'replace';
            readonly path: infer OperationPath extends StrictPath;
            readonly replacement: infer Replacement;
        }
            ? ReplaceAtPath<Value, OperationPath, Replacement>
            : Operation extends {
                readonly kind: 'require';
                readonly path: infer OperationPath extends StrictPath;
                readonly replacement: infer Replacement;
            }
                ? RequireAtPath<Value, OperationPath, Replacement>
                : Operation extends {
                    readonly kind: 'omit';
                    readonly path: infer OperationPath extends StrictPath;
                }
                    ? OmitAtPath<Value, OperationPath>
                    : Operation extends {
                        readonly kind: 'optionalize';
                        readonly path: infer OperationPath extends StrictPath;
                    }
                        ? OptionalizeAtPath<Value, OperationPath>
                        : Operation extends {
                            readonly kind: 'optional-add';
                            readonly path: infer OperationPath extends StrictPath;
                            readonly replacement: infer Replacement;
                        }
                            ? OptionalAddAtPath<Value, OperationPath, Replacement>
                            : Value;
