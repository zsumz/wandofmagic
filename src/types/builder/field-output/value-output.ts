import type { Coercer, CoercerInput, CoercerOutput } from '../../../coerce/types.js';
import type { MissingPolicy } from '../../../core/plan/operation-options.js';
import type { CompatibleKey, StringKeyOf, TrimmableKey } from '../../object/keys.js';
import type { TransformField } from '../../object/field.js';

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
