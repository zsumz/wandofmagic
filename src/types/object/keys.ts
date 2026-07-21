/** Keys excluded from Wandofmagic's JSON-like object model. */
type DangerousDataKey = '__proto__' | 'constructor' | 'prototype';

/** Require a literal, prototype-safe key for a newly created field. */
export type LiteralSafeKey<Key extends string> = string extends Key
    ? never
    : Key extends DangerousDataKey
        ? never
        : Key;

/** String keys supported by the initial public operations. */
export type StringKeyOf<Value> = Exclude<Extract<keyof Value, string>, DangerousDataKey>;

/** Keys whose defined value is accepted by a callback or coercer. */
export type CompatibleKey<Value, Accepted> = {
    [Key in StringKeyOf<Value>]-?: [Exclude<Value[Key], undefined>] extends [Accepted] ? Key : never;
}[StringKeyOf<Value>];

/** Fields that can be trimmed without changing their declared type. */
export type TrimmableKey<Value> = CompatibleKey<Value, string | null>;
