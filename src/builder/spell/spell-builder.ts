import type {
    MissingPolicy,
    MoveConflictPolicy,
    MoveOptions,
    StepOptions,
} from '../../core/plan/operation-options.js';
import type { SpellOptions } from '../../core/plan/spell-options.js';
import type { PathInput } from '../../core/path/path.js';
import type { Spell } from '../../core/execution/spell.js';
import { createDeriveStep } from '../../operations/flat/derive/create-derive-step.js';
import { createMoveStep } from '../../operations/path/move/create-move-step.js';
import { createRenameStep } from '../../operations/flat/rename/create-rename-step.js';
import { CompiledSpell } from '../../runtime/compiled-spell/compiled-spell.js';
import type { SynchronousCallbackValue } from '../../types/builder/callback-value.js';
import type {
    BuilderDeriveDependencies,
    BuilderDeriveKey,
    BuilderDeriveOutput,
    BuilderDeriveValues,
    BuilderOmitKeys,
    BuilderOmitOutput,
    BuilderOutput,
    BuilderRenameInput,
    BuilderRenameMapping,
    BuilderRenameOutput,
} from '../../types/builder/field-output.js';
import type { PathTypeOperation } from '../../types/path-program/operation.js';
import type {
    BuilderMoveProgram,
    BuilderMoveSourceInput,
} from '../../types/builder/move-output.js';
import type {
    BuilderPathOmitInput,
    BuilderPathOmitPaths,
    BuilderPathOmitProgram,
} from '../../types/builder/omit-output.js';
import type { SafePathInput } from '../../types/path/input.js';
import { BuilderState } from '../state/builder-state.js';
import { createOmitDispatchStep } from './operation-dispatch/omit-step.js';
import { PathSpellBuilder } from './path-spell-builder.js';

/** Immutable, type-evolving transformation-plan builder. */
export class SpellBuilder<Input extends object, Current extends object,
    Program extends readonly PathTypeOperation[] = readonly []>
    extends PathSpellBuilder<Input, Current, Program> {
    private constructor(state: BuilderState) {
        super(state);
    }
    public static create<Input extends object>(options: SpellOptions = {}): SpellBuilder<Input, Input> {
        return new SpellBuilder<Input, Input>(BuilderState.create(options));
    }
    public rename<const Mapping extends BuilderRenameMapping<BuilderOutput<Current, Program>>>(
        mapping: BuilderRenameInput<BuilderOutput<Current, Program>, Mapping>,
        options: StepOptions = {},
    ): SpellBuilder<Input, BuilderRenameOutput<BuilderOutput<Current, Program>, Mapping>> {
        const id = this.nextId('rename', options.id);
        return this.append<BuilderRenameOutput<BuilderOutput<Current, Program>, Mapping>>(
            createRenameStep(mapping, id));
    }
    public derive<
        const Key extends string,
        const Dependencies extends BuilderDeriveDependencies<BuilderOutput<Current, Program>>,
        Output,
    >(
        key: BuilderDeriveKey<BuilderOutput<Current, Program>, Key>,
        dependencies: Dependencies,
        derive: (values: BuilderDeriveValues<BuilderOutput<Current, Program>, Dependencies>) =>
        SynchronousCallbackValue<Output>,
        options: StepOptions = {},
    ): SpellBuilder<Input, BuilderDeriveOutput<BuilderOutput<Current, Program>, Key, Output>> {
        const id = this.nextId('derive', options.id);
        return this.append<BuilderDeriveOutput<BuilderOutput<Current, Program>, Key, Output>>(
            createDeriveStep(key, dependencies, derive, id));
    }

    public move<
        const Source extends PathInput,
        const Destination extends PathInput,
        const Missing extends MissingPolicy = 'error',
        const Conflict extends MoveConflictPolicy = 'error',
    >(
        source: BuilderMoveSourceInput<Current, Program, Source>,
        destination: Destination & SafePathInput<NoInfer<Destination>>,
        options: MoveOptions<Missing, Conflict> = {},
    ): SpellBuilder<Input, Current, BuilderMoveProgram<
        Current, Program, Source, Destination, Missing, Conflict
    >> {
        const id = this.nextId('move', options.id);
        return this.append<Current, BuilderMoveProgram<
            Current, Program, Source, Destination, Missing, Conflict
        >>(
            createMoveStep(
                source,
                destination,
                options.missing ?? 'error',
                options.conflict ?? 'error',
                id,
            ),
        );
    }

    public omit<const Paths extends BuilderPathOmitPaths>(
        paths: Paths & BuilderPathOmitInput<NoInfer<Paths>>,
        options?: StepOptions,
    ): SpellBuilder<Input, Current, BuilderPathOmitProgram<Program, Paths>>;
    public omit<const Keys extends BuilderOmitKeys<BuilderOutput<Current, Program>>>(
        keys: Keys,
        options?: StepOptions,
    ): SpellBuilder<Input, BuilderOmitOutput<BuilderOutput<Current, Program>, Keys>>;
    public omit(paths: readonly PathInput[], options: StepOptions = {}): unknown {
        const id = this.nextId('omit', options.id);
        return this.append<object, readonly PathTypeOperation[]>(
            createOmitDispatchStep(paths, id),
        );
    }

    public build(): Spell<Input, BuilderOutput<Current, Program>> {
        return new CompiledSpell<Input, BuilderOutput<Current, Program>>(
            this.state.steps, this.state.metadata);
    }

    protected rebuild<Next extends object, NextProgram extends readonly PathTypeOperation[]>(
        state: BuilderState,
    ): SpellBuilder<Input, Next, NextProgram> {
        return new SpellBuilder<Input, Next, NextProgram>(state);
    }
}
