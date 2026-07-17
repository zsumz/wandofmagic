import type { Path as StrictPath, PathSegment } from '../core/path.js';
import type {
    BuildOptionalPathShape,
    OptionalAddAtPath,
    OptionalizeAtPath,
} from './path-conditional.js';
import type { OmitAtPath } from './path-omit.js';
import type { PathTypeOperation } from './path-program-operation.js';
import type { BuildPathShape } from './path-shape.js';
import type { AddAtPath, ReplaceAtPath, RequireAtPath } from './path-write.js';

export interface RootState {
    readonly present: boolean;
    readonly required: boolean;
    readonly value: unknown;
}

type IsRequiredKey<Value, Key extends keyof Value> =
    Record<never, never> extends Pick<Value, Key> ? false : true;

export type InitialRootState<Value, Key extends PropertyKey> = Key extends keyof Value
    ? { readonly present: true; readonly required: IsRequiredKey<Value, Key>; readonly value: Value[Key] }
    : { readonly present: false; readonly required: false; readonly value: never };

type RebasedPath<Rest> = Rest extends readonly PathSegment[]
    ? readonly ['field', ...Rest] extends infer Candidate extends StrictPath
        ? Candidate
        : never
    : never;

type FieldValue<Value> = Value extends { field: infer Field } ? Field : never;

type NestedWrite<
    Value,
    Rest,
    Kind extends 'add' | 'replace' | 'require',
    Replacement,
> = Kind extends 'add'
    ? FieldValue<AddAtPath<{ field: Value }, RebasedPath<Rest>, Replacement>>
    : Kind extends 'replace'
        ? FieldValue<ReplaceAtPath<{ field: Value }, RebasedPath<Rest>, Replacement>>
        : FieldValue<RequireAtPath<{ field: Value }, RebasedPath<Rest>, Replacement>>;

type NestedOptionalAdd<Value, Rest, Replacement> = FieldValue<OptionalAddAtPath<
    { field: Value }, RebasedPath<Rest>, Replacement
>>;

type NestedOptionalize<Value, Rest> = FieldValue<OptionalizeAtPath<
    { field: Value }, RebasedPath<Rest>
>>;

type ApplyWriteAtRoot<
    State extends RootState,
    Rest,
    Kind extends 'add' | 'replace' | 'require',
    Replacement,
> = Rest extends readonly []
    ? Kind extends 'replace'
        ? State['present'] extends true
            ? { readonly present: true; readonly required: State['required']; readonly value: Replacement }
            : State
        : { readonly present: true; readonly required: true; readonly value: Replacement }
    : Kind extends 'add'
        ? {
            readonly present: true;
            readonly required: true;
            readonly value: State['present'] extends true
                ? NestedWrite<State['value'], Rest, Kind, Replacement>
                : BuildPathShape<Rest, Replacement>;
        }
        : State['present'] extends true
            ? {
                readonly present: true;
                readonly required: Kind extends 'require' ? true : State['required'];
                readonly value: NestedWrite<State['value'], Rest, Kind, Replacement>;
            }
            : State;

type ApplyOmitAtRoot<State extends RootState, Rest> = Rest extends readonly []
    ? { readonly present: false; readonly required: false; readonly value: never }
    : State['present'] extends true
        ? {
            readonly present: true;
            readonly required: State['required'];
            readonly value: FieldValue<OmitAtPath<
                { field: State['value'] },
                RebasedPath<Rest>
            >>;
        }
        : State;

type ApplyOptionalizeAtRoot<State extends RootState, Rest> = Rest extends readonly []
    ? State['present'] extends true
        ? { readonly present: true; readonly required: false; readonly value: State['value'] }
        : State
    : State['present'] extends true
        ? {
            readonly present: true;
            readonly required: State['required'];
            readonly value: NestedOptionalize<State['value'], Rest>;
        }
        : State;

type ApplyOptionalAddAtRoot<State extends RootState, Rest, Replacement> =
    Rest extends readonly []
        ? {
            readonly present: true;
            readonly required: State['present'] extends true ? State['required'] : false;
            readonly value: State['present'] extends true
                ? State['value'] | Replacement
                : Replacement;
        }
        : {
            readonly present: true;
            readonly required: State['present'] extends true ? State['required'] : false;
            readonly value: State['present'] extends true
                ? NestedOptionalAdd<State['value'], Rest, Replacement>
                : BuildOptionalPathShape<Rest, Replacement>;
        };

export type ApplyOperationAtRoot<
    State extends RootState,
    Operation extends PathTypeOperation,
> = Operation extends {
    readonly kind: infer Kind extends 'add' | 'replace' | 'require';
    readonly path: readonly [string, ...infer Rest];
    readonly replacement: infer Replacement;
}
    ? ApplyWriteAtRoot<State, Rest, Kind, Replacement>
    : Operation extends { readonly kind: 'omit'; readonly path: readonly [string, ...infer Rest] }
        ? ApplyOmitAtRoot<State, Rest>
        : Operation extends {
            readonly kind: 'optionalize';
            readonly path: readonly [string, ...infer Rest];
        }
            ? ApplyOptionalizeAtRoot<State, Rest>
            : Operation extends {
                readonly kind: 'optional-add';
                readonly path: readonly [string, ...infer Rest];
                readonly replacement: infer Replacement;
            }
                ? ApplyOptionalAddAtRoot<State, Rest, Replacement>
                : State;
