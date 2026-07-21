import type {
    BuildOptionalPathShape,
    OptionalAddAtPath,
} from '../path/optional-add.js';
import type { OptionalizeAtPath } from '../path/optionalize.js';
import type { FieldValue, RebasedPath, RootState } from './root-state.js';

type NestedOptionalAdd<Value, Rest, Replacement> = FieldValue<OptionalAddAtPath<
    { field: Value }, RebasedPath<Rest>, Replacement
>>;

type NestedOptionalize<Value, Rest> = FieldValue<OptionalizeAtPath<
    { field: Value }, RebasedPath<Rest>
>>;

export type ApplyOptionalizeAtRoot<State extends RootState, Rest> = Rest extends readonly []
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

export type ApplyOptionalAddAtRoot<State extends RootState, Rest, Replacement> =
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
