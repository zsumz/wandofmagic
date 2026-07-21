import type { MissingPolicy } from '../../core/plan/operation-options.js';
import type { ReadonlyCallbackValue } from '../builder/callback-value.js';
import type { StringKeyOf } from './keys.js';
import type { Simplify } from './shape.js';

/** Replace a known field while preserving optional and readonly modifiers. */
type ReplaceField<Value, Key extends keyof Value, Next> = Simplify<{
    [Property in keyof Value]: Property extends Key ? Next : Value[Property];
}>;

/** Replace a field and make it required on successful execution. */
type RequireField<Value, Key extends keyof Value, Next> = Simplify<
    Omit<Value, Key> & { [Property in keyof Pick<Value, Key>]-?: Next }
>;

export type TransformField<
    Value,
    Key extends keyof Value,
    Next,
    Policy extends MissingPolicy,
> = Policy extends 'skip' ? ReplaceField<Value, Key, Next> : RequireField<Value, Key, Next>;

/** Prevent `default()` from silently widening an existing defined field. */
export type DefaultValueGuard<Value, Key extends string, Fallback> = Key extends keyof Value
    ? [Exclude<Value[Key], undefined>] extends [never]
        ? unknown
        : [Fallback] extends [Exclude<Value[Key], undefined>]
            ? unknown
            : never
    : unknown;

/** Add or complete a defaulted field. `null` remains distinct from missing. */
export type DefaultField<Value, Key extends string, Fallback> = Key extends keyof Value
    ? RequireField<Value, Key, Exclude<Value[Key], undefined> | Fallback>
    : Simplify<Value & Record<Key, Fallback>>;

/** Add a new derived field. */
export type AddField<Value, Key extends string, Next> = Simplify<Value & Record<Key, Next>>;

/** Remove fields and normalize the resulting editor display. */
export type OmitFields<Value, Keys extends PropertyKey> = Simplify<Omit<Value, Keys>>;

/** Tuple of dependency values passed to a derive callback. */
export type ValuesAtKeys<Value, Keys extends ReadonlyArray<StringKeyOf<Value>>> = Readonly<{
    [Index in keyof Keys]: Keys[Index] extends keyof Value
        ? ReadonlyCallbackValue<Exclude<Value[Keys[Index]], undefined>>
        : never;
}>;
