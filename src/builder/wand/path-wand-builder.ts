import type {
    MissingOptions,
    MissingPolicy,
    StepOptions,
} from '../../core/plan/operation-options.js';
import type {
    Path,
    PathInput,
} from '../../core/path/path.js';
import {
    invokeBuilderDefault,
    invokeBuilderTransform,
} from '../../internal/type-boundary/builder.js';
import type { ErasedTransform } from '../../internal/type-boundary/callback.js';
import type {
    ReadonlyCallbackValue,
    SynchronousCallbackValue,
} from '../../types/builder/callback-value.js';
import type {
    BuilderOutput,
    BuilderDefaultKey,
    BuilderDefaultOutput,
    BuilderTransformKey,
    BuilderTransformOutput,
    BuilderTransformValue,
} from '../../types/builder/field-output.js';
import type {
    BuilderPathTransformInput,
    BuilderPathTransformProgram,
    BuilderPathTransformValue,
} from '../../types/builder/transform-output.js';
import type {
    BuilderPathDefaultGuard,
    BuilderPathDefaultProgram,
    BuilderSetProgram,
} from '../../types/builder/write-output.js';
import type { SafePathInput } from '../../types/path/input.js';
import type { PathTypeOperation } from '../../types/path-program/operation.js';
import type { DefaultValueGuard } from '../../types/object/field.js';
import { DeriveWandBuilder } from './derive-wand-builder.js';
import type { SpellBuilder } from '../spell/spell-builder.js';
import type { WandBuilder } from './wand-builder.js';

/** One-off operations that retain or append deferred record-rooted path state. */
export abstract class PathWandBuilder<
    Input extends object,
    Current extends object,
    Program extends readonly PathTypeOperation[],
> extends DeriveWandBuilder<Input, Current, Program> {
    /** Apply a fallback only when a safe tuple path or top-level field is absent or undefined. */
    public default<
        const OperationPath extends Path,
        const Fallback,
    >(
        path: OperationPath & SafePathInput<NoInfer<OperationPath>>,
        fallback: Fallback & BuilderPathDefaultGuard<
            Current, Program, OperationPath, Fallback
        >,
        options?: StepOptions,
    ): WandBuilder<Input, Current, BuilderPathDefaultProgram<
        Current, Program, OperationPath, Fallback
    >>;
    public default<const Key extends string, const Fallback>(
        key: BuilderDefaultKey<Key>,
        fallback: Fallback & DefaultValueGuard<BuilderOutput<Current, Program>, Key, Fallback>,
        options?: StepOptions,
    ): WandBuilder<Input, BuilderDefaultOutput<
        BuilderOutput<Current, Program>, Key, Fallback
    >>;
    public default(
        path: PathInput,
        fallback: unknown,
        options: StepOptions = {},
    ): unknown {
        const next = invokeBuilderDefault<SpellBuilder<
            Input, object, readonly PathTypeOperation[]
        >>(this.builder, path, fallback, options);
        return this.rebuild<object, readonly PathTypeOperation[]>(next);
    }

    /** Transform a top-level field or a safe tuple path without mutating the input. */
    public transform<
        const OperationPath extends Path,
        Output,
        const Policy extends MissingPolicy = 'error',
    >(
        path: BuilderPathTransformInput<Current, Program, OperationPath>,
        transform: (value: ReadonlyCallbackValue<BuilderPathTransformValue<
            Current, Program, OperationPath>>) => SynchronousCallbackValue<Output>,
        options?: MissingOptions<Policy>,
    ): WandBuilder<Input, Current, BuilderPathTransformProgram<
        Program, OperationPath, Output, Policy
    >>;

    public transform<
        const Key extends BuilderTransformKey<BuilderOutput<Current, Program>>,
        Output,
        const Policy extends MissingPolicy = 'error',
    >(
        key: Key,
        transform: (value: ReadonlyCallbackValue<BuilderTransformValue<
            BuilderOutput<Current, Program>, Key>>) => SynchronousCallbackValue<Output>,
        options?: MissingOptions<Policy>,
    ): WandBuilder<Input, BuilderTransformOutput<
        BuilderOutput<Current, Program>, Key, Output, Policy
    >>;

    public transform(
        path: PathInput,
        transform: ErasedTransform,
        options: MissingOptions<MissingPolicy> = {},
    ): unknown {
        const next = invokeBuilderTransform<SpellBuilder<
            Input, object, readonly PathTypeOperation[]
        >>(this.builder, path, transform, options);
        return this.rebuild<object, readonly PathTypeOperation[]>(next);
    }

    /** Unconditionally write a constant at a safe record-rooted path. */
    public set<const OperationPath extends PathInput, const Replacement>(
        path: OperationPath & SafePathInput<NoInfer<OperationPath>>,
        replacement: Replacement,
        options: StepOptions = {},
    ): WandBuilder<
        Input,
        Current,
        BuilderSetProgram<Program, OperationPath, Replacement>
    > {
        return this.rebuild(
            this.builder.set<OperationPath, Replacement>(path, replacement, options),
        );
    }

    protected abstract override rebuild<
        Next extends object,
        NextProgram extends readonly PathTypeOperation[],
    >(builder: SpellBuilder<Input, Next, NextProgram>): WandBuilder<Input, Next, NextProgram>;
}
