import type {
    Path as StrictPath,
    PathSegment,
} from '../../core/path/path.js';
import type { PathValueAtSegments } from '../path/value.js';
import type { PathTypeOperation } from './operation.js';
import type { EvaluateRootState, RootState } from './state.js';

type ValueFromRootState<
    State extends RootState,
    Rest extends readonly PathSegment[],
> = State['present'] extends true ? PathValueAtSegments<State['value'], Rest> : never;

type OperationAtRoot<Operation, Root extends string> = Operation extends {
    readonly path: readonly [Root, ...readonly PathSegment[]];
}
    ? Operation
    : never;

type ProgramOperationAtRoot<
    Program extends readonly PathTypeOperation[],
    Root extends string,
> = OperationAtRoot<Program[number], Root>;

type InitialPathValue<
    Value extends object,
    Root extends string,
    Rest extends readonly PathSegment[],
> = Root extends keyof Value ? PathValueAtSegments<Value[Root], Rest> : never;

type LastPathTypeOperation<Program extends readonly PathTypeOperation[]> =
    Program extends readonly [...readonly PathTypeOperation[], infer Last extends PathTypeOperation]
        ? Last
        : never;

type UniformPathValue<
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
    Last extends PathTypeOperation = LastPathTypeOperation<Program>,
> = [Last] extends [never]
    ? { readonly found: false }
    : Last extends {
        readonly kind: 'add' | 'replace' | 'require';
        readonly path: OperationPath;
        readonly replacement: infer Replacement;
    }
        ? Program[number] extends { readonly kind: Last['kind']; readonly path: OperationPath }
            ? { readonly found: true; readonly value: Replacement }
            : { readonly found: false }
        : Last extends { readonly kind: 'omit'; readonly path: OperationPath }
            ? Program[number] extends { readonly kind: 'omit'; readonly path: OperationPath }
                ? { readonly found: true; readonly value: never }
                : { readonly found: false }
            : { readonly found: false };

type EvaluatedPathValue<
    Value extends object,
    Program extends readonly PathTypeOperation[],
    Root extends string,
    Rest extends readonly PathSegment[],
> = [ProgramOperationAtRoot<Program, Root>] extends [never]
    ? InitialPathValue<Value, Root, Rest>
    : EvaluateRootState<Value, Root, Program> extends infer State extends RootState
        ? ValueFromRootState<State, Rest>
        : never;

/** Resolve one path from deferred builder state without materializing the complete object. */
export type EvaluatePathTypeOperationsValue<
    Value,
    Program extends readonly PathTypeOperation[],
    OperationPath extends StrictPath,
> = UniformPathValue<Program, OperationPath> extends {
    readonly found: true;
    readonly value: infer Replacement;
}
    ? Replacement
    : Value extends object
        ? OperationPath extends readonly [
            infer Root extends string,
            ...infer Rest extends readonly PathSegment[],
        ]
            ? EvaluatedPathValue<Value, Program, Root, Rest>
            : never
        : never;
