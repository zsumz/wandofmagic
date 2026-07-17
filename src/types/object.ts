import type { MissingPolicy } from '../core/options.js';
import type { ReadonlyCallbackValue } from './callback.js';
import type { StringKeyOf } from './keys.js';

/** Flatten intersections so editor hovers stay readable. */
type Simplify<Value> = { [Key in keyof Value]: Value[Key] } & {};

/** Reject object-literal keys outside a known key set. */
export type NoUnknownKeys<Actual, Allowed extends PropertyKey> = Actual &
    Record<Exclude<keyof Actual, Allowed>, never>;

type WidenedRenameDestination<Mapping> = {
    [Key in keyof Mapping]-?: string extends Mapping[Key] ? Key : never;
}[keyof Mapping];

/** Reject mappings whose destination values widened from literals to `string`. */
export type LiteralRenameDestinations<Mapping> = [WidenedRenameDestination<Mapping>] extends [never]
    ? unknown
    : never;

type DangerousRenameDestination<Mapping> = {
    [Key in keyof Mapping]-?: Extract<
        Mapping[Key],
        '__proto__' | 'constructor' | 'prototype'
    > extends never
        ? never
        : Key;
}[keyof Mapping];

/** Reject mappings whose destination is unsafe for an own data property. */
export type SafeRenameDestinations<Mapping> = [DangerousRenameDestination<Mapping>] extends [never]
    ? unknown
    : never;

type RequiredKeyOf<Value> = {
    [Key in keyof Value]-?: Record<never, never> extends Pick<Value, Key> ? never : Key;
}[keyof Value];

type GuaranteedRenameCollision<Value, Mapping> = {
    [Source in keyof Mapping]-?: Source extends RequiredKeyOf<Value>
        ? Mapping[Source] extends RequiredKeyOf<Value>
            ? Mapping[Source] extends keyof Mapping
                ? never
                : Source
            : never
        : never;
}[keyof Mapping];

/** Reject rename plans that must collide for every value accepted by the input type. */
export type NoGuaranteedRenameCollisions<Value, Mapping> = [
    GuaranteedRenameCollision<Value, Mapping>,
] extends [never]
    ? unknown
    : never;

/** Rename keys while preserving each source property's modifiers. */
export type RenameRecord<
    Value,
    Mapping extends Partial<Record<StringKeyOf<Value>, string>>,
> = Simplify<{
    [Key in keyof Value as Key extends keyof Mapping
        ? Mapping[Key] extends PropertyKey
            ? Mapping[Key]
            : Key
        : Key]: Value[Key];
}>;

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
