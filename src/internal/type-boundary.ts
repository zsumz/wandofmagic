import type { Coercer } from '../coerce/types.js';
import type { DataRecord } from '../core/data-record.js';
import type { MissingOptions, MissingPolicy, StepOptions } from '../core/options.js';
import type { PathInput } from '../core/path.js';

export type ErasedDerive = (values: never) => unknown;
export type ErasedTransform = (value: never) => unknown;

/**
 * Audited type boundary between runtime records and the compile-time plan.
 * Keep assertions in this file rather than scattering them through operations.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The caller selects the compiled spell's output type.
export function castOutput<Output extends object>(value: DataRecord): Output {
    return value as unknown as Output;
}

export function createDataRecord(prototype: object | null): DataRecord {
    // Use the ordinary object allocation path unless the caller explicitly needs a null prototype.
    if (prototype === Object.prototype) {
        return {};
    }

    return Object.create(prototype) as DataRecord;
}

export function getObjectPrototype(value: object): object | null {
    return Object.getPrototypeOf(value) as object | null;
}

export function getDataPropertyValue(descriptor: PropertyDescriptor): unknown {
    return descriptor.value as unknown;
}

export function invokeTransform(transform: ErasedTransform, value: unknown): unknown {
    return transform(value as never);
}

interface TransformBuilderBoundary {
    transform(
        path: PathInput,
        transform: ErasedTransform,
        options: MissingOptions<MissingPolicy>,
    ): object;
}

interface CoerceBuilderBoundary {
    coerce(
        path: PathInput,
        coercer: Coercer<unknown, unknown>,
        options: MissingOptions<MissingPolicy>,
    ): object;
}

interface DefaultBuilderBoundary {
    default(path: PathInput, fallback: unknown, options: StepOptions): object;
}

interface OmitBuilderBoundary {
    omit(paths: readonly PathInput[], options: StepOptions): object;
}

/** Invoke an omit overload after its public path-list types have already been checked. */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The checked overload selects the returned builder type.
export function invokeBuilderOmit<Output extends object>(
    builder: object,
    paths: readonly PathInput[],
    options: StepOptions,
): Output {
    return (builder as OmitBuilderBoundary).omit(paths, options) as Output;
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

export function invokeDerive(derive: ErasedDerive, values: readonly unknown[]): unknown {
    return derive(values as never);
}

export function castInputRecord(value: object): DataRecord {
    return value as DataRecord;
}

/** Narrow an untrusted array without allowing Array.isArray's `any[]` predicate to escape. */
export function isUnknownArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

/** Allocate a typed sparse array without exposing the standard library's `any[]` constructor. */
export function createSparseDataArray(length: number): unknown[] {
    return new Array(length) as unknown[];
}
