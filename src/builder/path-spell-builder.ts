import type { MissingOptions, MissingPolicy, StepOptions } from '../core/options.js';
import type { Path, PathInput } from '../core/path.js';
import type { ErasedTransform } from '../internal/type-boundary.js';
import { createDefaultStep } from '../operations/default.js';
import { createDefaultPathStep } from '../operations/default-path.js';
import { createSetStep } from '../operations/set.js';
import { createTransformStep } from '../operations/transform.js';
import { createTransformPathStep } from '../operations/transform-path.js';
import type { ReadonlyCallbackValue, SynchronousCallbackValue } from '../types/callback.js';
import type {
    BuilderOutput,
    BuilderDefaultKey,
    BuilderDefaultOutput,
    BuilderTransformKey,
    BuilderTransformOutput,
    BuilderTransformValue,
} from '../types/builder-output.js';
import type {
    BuilderPathDefaultGuard,
    BuilderPathDefaultProgram,
    BuilderPathTransformInput,
    BuilderPathTransformProgram,
    BuilderPathTransformValue,
    BuilderSetProgram,
} from '../types/path-builder-output.js';
import type { SafePathInput } from '../types/path-input.js';
import type { PathTypeOperation } from '../types/path-program-operation.js';
import type { DefaultValueGuard } from '../types/object.js';
import type { BuilderState } from './builder-state.js';
import { CoerceSpellBuilder } from './coerce-spell-builder.js';
import type { SpellBuilder } from './spell-builder.js';

/** Fluent operations that retain or append deferred record-rooted path state. */
export abstract class PathSpellBuilder<
    Input extends object,
    Current extends object,
    Program extends readonly PathTypeOperation[],
> extends CoerceSpellBuilder<Input, Current, Program> {
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
    ): SpellBuilder<Input, Current, BuilderPathDefaultProgram<
        Current, Program, OperationPath, Fallback
    >>;
    public default<const Key extends string, const Fallback>(
        key: BuilderDefaultKey<Key>,
        fallback: Fallback & DefaultValueGuard<BuilderOutput<Current, Program>, Key, Fallback>,
        options?: StepOptions,
    ): SpellBuilder<Input, BuilderDefaultOutput<
        BuilderOutput<Current, Program>, Key, Fallback
    >>;
    public default(
        path: PathInput,
        fallback: unknown,
        options: StepOptions = {},
    ): unknown {
        const id = this.nextId('default', options.id);
        return typeof path === 'string'
            ? this.append<object>(createDefaultStep(path, fallback, id))
            : this.append<object, readonly PathTypeOperation[]>(
                createDefaultPathStep(path, fallback, id),
            );
    }

    /** Transform a safe tuple path or top-level field without mutating the input. */
    public transform<
        const OperationPath extends Path,
        Output,
        const Policy extends MissingPolicy = 'error',
    >(
        path: BuilderPathTransformInput<Current, Program, OperationPath>,
        transform: (value: ReadonlyCallbackValue<BuilderPathTransformValue<
            Current, Program, OperationPath>>) => SynchronousCallbackValue<Output>,
        options?: MissingOptions<Policy>,
    ): SpellBuilder<Input, Current, BuilderPathTransformProgram<
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
    ): SpellBuilder<Input, BuilderTransformOutput<
        BuilderOutput<Current, Program>, Key, Output, Policy
    >>;
    public transform(
        path: PathInput,
        transform: ErasedTransform,
        options: MissingOptions<MissingPolicy> = {},
    ): unknown {
        const missing = options.missing ?? 'error';
        const id = this.nextId('transform', options.id);
        return typeof path === 'string'
            ? this.append<object>(createTransformStep(path, transform, missing, id))
            : this.append<object, readonly PathTypeOperation[]>(
                createTransformPathStep(path, transform, missing, id),
            );
    }
    /** Unconditionally write a constant at a safe record-rooted path. */
    public set<const OperationPath extends PathInput, const Replacement>(
        path: OperationPath & SafePathInput<NoInfer<OperationPath>>,
        replacement: Replacement,
        options: StepOptions = {},
    ): SpellBuilder<
        Input,
        Current,
        BuilderSetProgram<Program, OperationPath, Replacement>
    > {
        const id = this.nextId('set', options.id);
        return this.append<
            Current,
            BuilderSetProgram<Program, OperationPath, Replacement>
        >(
            createSetStep(path, replacement, id),
        );
    }

    protected abstract override rebuild<
        Next extends object,
        NextProgram extends readonly PathTypeOperation[],
    >(state: BuilderState): SpellBuilder<Input, Next, NextProgram>;
}
