import type { StepOptions } from '../../core/plan/operation-options.js';
import type { Path, PathInput } from '../../core/path/path.js';
import { invokeBuilderDerive } from '../../internal/type-boundary/builder.js';
import type { ErasedDerive } from '../../internal/type-boundary/callback.js';
import type { SynchronousCallbackValue } from '../../types/builder/callback-value.js';
import type {
    BuilderDerivePathDependencies,
    BuilderDerivePathDestination,
    BuilderDerivePathInput,
    BuilderDerivePathProgram,
    BuilderDerivePathValues,
} from '../../types/builder/derive-output.js';
import type {
    BuilderDeriveDependencies,
    BuilderDeriveKey,
    BuilderDeriveOutput,
    BuilderDeriveValues,
    BuilderOutput,
} from '../../types/builder/field-output.js';
import type { PathTypeOperation } from '../../types/path-program/operation.js';
import type { SpellBuilder } from '../spell/spell-builder.js';
import type { WandBuilder } from './wand-builder.js';
import { TrimWandBuilder } from './trim-wand-builder.js';

/** Flat and deep derivation shared by the remaining one-off builder layers. */
export abstract class DeriveWandBuilder<
    Input extends object,
    Current extends object,
    Program extends readonly PathTypeOperation[],
> extends TrimWandBuilder<Input, Current, Program> {
    public derive<
        const Destination extends Path,
        const Dependencies extends BuilderDerivePathDependencies,
        Output,
    >(
        destination: BuilderDerivePathDestination<Current, Program, Destination>,
        dependencies: Dependencies & BuilderDerivePathInput<Current, Program, Dependencies>,
        derive: (values: BuilderDerivePathValues<Current, Program, Dependencies>) =>
        SynchronousCallbackValue<Output>,
        options?: StepOptions,
    ): WandBuilder<Input, Current, BuilderDerivePathProgram<Program, Destination, Output>>;
    public derive<
        const Key extends string,
        const Dependencies extends BuilderDeriveDependencies<BuilderOutput<Current, Program>>,
        Output,
    >(
        key: BuilderDeriveKey<BuilderOutput<Current, Program>, Key>,
        dependencies: Dependencies,
        derive: (values: BuilderDeriveValues<BuilderOutput<Current, Program>, Dependencies>) =>
        SynchronousCallbackValue<Output>,
        options?: StepOptions,
    ): WandBuilder<Input, BuilderDeriveOutput<BuilderOutput<Current, Program>, Key, Output>>;
    public derive(
        destination: PathInput,
        dependencies: readonly PathInput[],
        derive: ErasedDerive,
        options: StepOptions = {},
    ): unknown {
        const next = invokeBuilderDerive<SpellBuilder<
            Input, object, readonly PathTypeOperation[]
        >>(this.builder, destination, dependencies, derive, options);
        return this.rebuild<object, readonly PathTypeOperation[]>(next);
    }

    protected abstract override rebuild<
        Next extends object,
        NextProgram extends readonly PathTypeOperation[],
    >(builder: SpellBuilder<Input, Next, NextProgram>): WandBuilder<Input, Next, NextProgram>;
}
