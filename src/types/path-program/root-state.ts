import type {
    Path as StrictPath,
    PathSegment,
} from '../../core/path/path.js';

export interface RootState {
    readonly present: boolean;
    readonly required: boolean;
    readonly value: unknown;
}

type IsRequiredKey<Value, Key extends keyof Value> =
    Record<never, never> extends Pick<Value, Key> ? false : true;

export type InitialRootState<Value, Key extends PropertyKey> = Key extends keyof Value
    ? {
        readonly present: true;
        readonly required: IsRequiredKey<Value, Key>;
        readonly value: Value[Key];
    }
    : { readonly present: false; readonly required: false; readonly value: never };

export type RebasedPath<Rest> = Rest extends readonly PathSegment[]
    ? readonly ['field', ...Rest] extends infer Candidate extends StrictPath
        ? Candidate
        : never
    : never;

export type FieldValue<Value> = Value extends { field: infer Field } ? Field : never;
