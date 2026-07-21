import type { OmitAtPath } from '../path/omit.js';
import type { FieldValue, RebasedPath, RootState } from './root-state.js';

export type ApplyOmitAtRoot<State extends RootState, Rest> = Rest extends readonly []
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
