import type { BuildPathShape } from '../path/shape.js';
import type { AddAtPath } from '../path/add.js';
import type { ReplaceAtPath } from '../path/replace.js';
import type { RequireAtPath } from '../path/require.js';
import type { FieldValue, RebasedPath, RootState } from './root-state.js';

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

export type ApplyWriteAtRoot<
    State extends RootState,
    Rest,
    Kind extends 'add' | 'replace' | 'require',
    Replacement,
> = Rest extends readonly []
    ? Kind extends 'replace'
        ? State['present'] extends true
            ? {
                readonly present: true;
                readonly required: State['required'];
                readonly value: Replacement;
            }
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
