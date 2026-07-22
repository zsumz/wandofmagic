import type { Coercer } from '../../coerce/types.js';
import type {
    MissingOptions,
    MissingPolicy,
    StepOptions,
} from '../../core/plan/operation-options.js';
import type { PathInput } from '../../core/path/path.js';
import type { CoerceBuilderBoundary } from './builder/coerce-builder-boundary.js';
import type { DefaultBuilderBoundary } from './builder/default-builder-boundary.js';
import type { OmitBuilderBoundary } from './builder/omit-builder-boundary.js';
import type { PickBuilderBoundary } from './builder/pick-builder-boundary.js';
import type { TransformBuilderBoundary } from './builder/transform-builder-boundary.js';
import type { TrimBuilderBoundary } from './builder/trim-builder-boundary.js';
import type { ErasedTransform } from './callback.js';

/** Invoke an omit overload after its public path-list types have already been checked. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The checked overload selects the returned builder type.
export function invokeBuilderOmit<Output extends object>(
    builder: object,
    paths: readonly PathInput[],
    options: StepOptions,
): Output {
    return (builder as OmitBuilderBoundary).omit(paths, options) as Output;
}

/** Invoke a pick overload after its public path-list types have already been checked. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The checked overload selects the returned builder type.
export function invokeBuilderPick<Output extends object>(
    builder: object,
    paths: readonly PathInput[],
    options: StepOptions,
): Output {
    return (builder as PickBuilderBoundary).pick(paths, options) as Output;
}

/** Invoke a default overload after its public path and fallback types have already been checked. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The checked overload selects the returned builder type.
export function invokeBuilderDefault<Output extends object>(
    builder: object,
    path: PathInput,
    fallback: unknown,
    options: StepOptions,
): Output {
    return (builder as DefaultBuilderBoundary).default(path, fallback, options) as Output;
}

/** Invoke a coerce overload after its public path and coercer types have already been checked. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The checked overload selects the returned builder type.
export function invokeBuilderCoerce<Output extends object>(
    builder: object,
    path: PathInput,
    coercer: Coercer<unknown, unknown>,
    options: MissingOptions<MissingPolicy>,
): Output {
    return (builder as CoerceBuilderBoundary).coerce(path, coercer, options) as Output;
}

/** Invoke a builder overload after its public path and callback types have already been checked. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The checked overload selects the returned builder type.
export function invokeBuilderTransform<Output extends object>(
    builder: object,
    path: PathInput,
    transform: ErasedTransform,
    options: MissingOptions<MissingPolicy>,
): Output {
    return (builder as TransformBuilderBoundary).transform(path, transform, options) as Output;
}

/** Invoke a trim overload after its public path-list types have already been checked. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The checked overload selects the returned builder type.
export function invokeBuilderTrim<Output extends object>(
    builder: object,
    paths: readonly PathInput[],
    options: StepOptions,
): Output {
    return (builder as TrimBuilderBoundary).trim(paths, options) as Output;
}
