import type {
    MissingPolicy,
    MoveConflictPolicy,
    MoveOptions,
    SpellOptions,
    StepOptions,
} from '../core/options.js';
import type { PathInput } from '../core/path.js';
import type { Spell } from '../core/spell.js';
import { createDeriveStep } from '../operations/derive.js';
import { createOmitStep } from '../operations/omit.js';
import { createOmitPathsStep } from '../operations/omit-paths.js';
import { createMoveStep } from '../operations/move.js';
import { createRenameStep } from '../operations/rename.js';
import { createTrimStep } from '../operations/trim.js';
import { CompiledSpell } from '../runtime/compiled-spell.js';
import type { SynchronousCallbackValue } from '../types/callback.js';
import type {
    BuilderDeriveDependencies, BuilderDeriveKey, BuilderDeriveOutput,
    BuilderDeriveValues, BuilderOmitKeys, BuilderOmitOutput, BuilderOutput, BuilderRenameInput,
    BuilderRenameMapping, BuilderRenameOutput, BuilderTrimKey,
} from '../types/builder-output.js';
import type { PathTypeOperation } from '../types/path-program-operation.js';
import type {
    BuilderPathOmitInput,
    BuilderPathOmitPaths,
    BuilderPathOmitProgram,
    BuilderMoveProgram,
    BuilderMoveSourceInput,
} from '../types/path-builder-output.js';
import type { SafePathInput } from '../types/path-input.js';
import { BuilderState } from './builder-state.js';
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
    public trim(
        keys: ReadonlyArray<BuilderTrimKey<BuilderOutput<Current, Program>>>,
        options: StepOptions = {},
    ): SpellBuilder<Input, BuilderOutput<Current, Program>> {
        const id = this.nextId('trim', options.id);
        return this.append<BuilderOutput<Current, Program>>(createTrimStep(keys, id));
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
        const flatKeys = readFlatOmitKeys(paths);
        return flatKeys === undefined
            ? this.append<object, readonly PathTypeOperation[]>(createOmitPathsStep(paths, id))
            : this.append<object>(createOmitStep(flatKeys, id));
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

function readFlatOmitKeys(paths: readonly PathInput[]): readonly string[] | undefined {
    const keys: string[] = [];
    for (const path of paths) {
        if (typeof path !== 'string') {
            return undefined;
        }
        keys.push(path);
    }
    return keys;
}
