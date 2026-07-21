import type { LiteralSafeKey, StringKeyOf } from '../../object/keys.js';
import type {
    AddField,
    DefaultField,
    OmitFields,
    ValuesAtKeys,
} from '../../object/field.js';

export type BuilderDefaultKey<Key extends string> = LiteralSafeKey<Key>;
export type BuilderDefaultOutput<Output extends object, Key extends string, Fallback> =
    DefaultField<Output, Key, Fallback>;

export type BuilderDeriveDependencies<Output extends object> = readonly [
    StringKeyOf<Output>,
    ...Array<StringKeyOf<Output>>,
];
export type BuilderDeriveKey<Output extends object, Key extends string> =
    LiteralSafeKey<Key> & (Key extends keyof Output ? never : unknown);
export type BuilderDeriveValues<
    Output extends object,
    Dependencies extends ReadonlyArray<StringKeyOf<Output>>,
> = ValuesAtKeys<Output, Dependencies>;
export type BuilderDeriveOutput<Output extends object, Key extends string, Value> =
    AddField<Output, Key, Value>;

export type BuilderOmitKeys<Output extends object> = ReadonlyArray<StringKeyOf<Output>>;
export type BuilderOmitOutput<Output extends object, Keys extends readonly PropertyKey[]> =
    OmitFields<Output, Keys[number]>;
