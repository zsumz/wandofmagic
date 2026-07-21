import type { Path as StrictPath } from '../../core/path/path.js';
import type { OptionalAddAtPath } from '../path/optional-add.js';
import type { OptionalizeAtPath } from '../path/optionalize.js';
import type { OmitAtPath } from '../path/omit.js';
import type { AddAtPath } from '../path/add.js';
import type { ReplaceAtPath } from '../path/replace.js';
import type { RequireAtPath } from '../path/require.js';
import type { PathTypeOperation } from './operation.js';
import type { CompilePathTypeOperations } from './state.js';

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
