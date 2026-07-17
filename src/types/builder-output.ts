import type { Coercer, CoercerInput, CoercerOutput } from '../coerce/types.js';
import type { MissingPolicy } from '../core/options.js';
import type { PathTypeOperation } from './path-program-operation.js';
import type { EvaluatePathTypeOperations } from './path-program.js';
import type { CompatibleKey, LiteralSafeKey, StringKeyOf, TrimmableKey } from './keys.js';
import type {
    AddField,
    DefaultField,
    LiteralRenameDestinations,
    NoGuaranteedRenameCollisions,
    NoUnknownKeys,
    OmitFields,
    RenameRecord,
    SafeRenameDestinations,
    TransformField,
    ValuesAtKeys,
} from './object.js';

export type BuilderOutput<
    Current extends object,
    Program extends readonly PathTypeOperation[],
> = EvaluatePathTypeOperations<Current, Program>;

export type BuilderRenameMapping<Output extends object> =
    Partial<Record<StringKeyOf<Output>, string>>;

export type BuilderRenameInput<
    Output extends object,
    Mapping extends BuilderRenameMapping<Output>,
> =
    NoUnknownKeys<Mapping, StringKeyOf<Output>>
    & LiteralRenameDestinations<Mapping>
    & SafeRenameDestinations<Mapping>
    & NoGuaranteedRenameCollisions<Output, Mapping>;

export type BuilderRenameOutput<
    Output extends object,
    Mapping extends BuilderRenameMapping<Output>,
> = RenameRecord<Output, Mapping>;

export type BuilderTrimKey<Output extends object> = TrimmableKey<Output>;

export type BuilderCoerceKey<Output extends object, Value extends Coercer<unknown, unknown>> =
    CompatibleKey<Output, CoercerInput<Value>>;

export type BuilderCoerceOutput<
    Output extends object,
    Key extends keyof Output,
    Value extends Coercer<unknown, unknown>,
    Policy extends MissingPolicy,
> = TransformField<Output, Key, CoercerOutput<Value>, Policy>;

export type BuilderTransformKey<Output extends object> = StringKeyOf<Output>;
export type BuilderTransformValue<Output extends object, Key extends keyof Output> =
    Exclude<Output[Key], undefined>;
export type BuilderTransformOutput<
    Current extends object,
    Key extends keyof Current,
    Output,
    Policy extends MissingPolicy,
> = TransformField<Current, Key, Output, Policy>;

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
> =
    ValuesAtKeys<Output, Dependencies>;
export type BuilderDeriveOutput<Output extends object, Key extends string, Value> =
    AddField<Output, Key, Value>;

export type BuilderOmitKeys<Output extends object> = ReadonlyArray<StringKeyOf<Output>>;
export type BuilderOmitOutput<Output extends object, Keys extends readonly PropertyKey[]> =
    OmitFields<Output, Keys[number]>;
