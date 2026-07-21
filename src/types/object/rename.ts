import type { StringKeyOf } from './keys.js';
import type { Simplify } from './shape.js';

/** Reject object-literal keys outside a known key set. */
export type NoUnknownKeys<Actual, Allowed extends PropertyKey> = Actual &
    Record<Exclude<keyof Actual, Allowed>, never>;

type WidenedRenameDestination<Mapping> = {
    [Key in keyof Mapping]-?: string extends Mapping[Key] ? Key : never;
}[keyof Mapping];

/** Reject mappings whose destination values widened from literals to `string`. */
export type LiteralRenameDestinations<Mapping> = [
    WidenedRenameDestination<Mapping>,
] extends [never]
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
export type SafeRenameDestinations<Mapping> = [
    DangerousRenameDestination<Mapping>,
] extends [never]
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
