import type {
    MissingPolicy,
    MoveConflictPolicy,
    MoveOptions,
    StepOptions,
} from '../../core/plan/operation-options.js';
import type { PathInput } from '../../core/path/path.js';
import { invokeBuilderOmit } from '../../internal/type-boundary/builder.js';
import type {
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
import { PathWandBuilder } from './path-wand-builder.js';
import type { SpellBuilder } from '../spell/spell-builder.js';

/** A one-off wand backed by the same reusable spell builder. */
export class WandBuilder<
    Input extends object,
    Current extends object,
    Program extends readonly PathTypeOperation[] = readonly [],
> extends PathWandBuilder<Input, Current, Program> {
    public rename<
        const Mapping extends BuilderRenameMapping<BuilderOutput<Current, Program>>,
    >(
        mapping: BuilderRenameInput<BuilderOutput<Current, Program>, Mapping>,
        options: StepOptions = {},
    ): WandBuilder<Input, BuilderRenameOutput<BuilderOutput<Current, Program>, Mapping>> {
        return this.rebuild(this.builder.rename<Mapping>(mapping, options));
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
    ): WandBuilder<Input, Current, BuilderMoveProgram<
        Current, Program, Source, Destination, Missing, Conflict
    >> {
        return this.rebuild(this.builder.move<Source, Destination, Missing, Conflict>(
            source,
            destination,
            options,
        ));
    }

    public omit<const Paths extends BuilderPathOmitPaths>(
        paths: Paths & BuilderPathOmitInput<NoInfer<Paths>>,
        options?: StepOptions,
    ): WandBuilder<Input, Current, BuilderPathOmitProgram<Program, Paths>>;
    public omit<const Keys extends BuilderOmitKeys<BuilderOutput<Current, Program>>>(
        keys: Keys,
        options?: StepOptions,
    ): WandBuilder<Input, BuilderOmitOutput<BuilderOutput<Current, Program>, Keys>>;
    public omit(paths: readonly PathInput[], options: StepOptions = {}): unknown {
        const next = invokeBuilderOmit<SpellBuilder<
            Input, object, readonly PathTypeOperation[]
        >>(this.builder, paths, options);
        return this.rebuild<object, readonly PathTypeOperation[]>(next);
    }

    protected rebuild<Next extends object, NextProgram extends readonly PathTypeOperation[]>(
        builder: SpellBuilder<Input, Next, NextProgram>,
    ): WandBuilder<Input, Next, NextProgram> {
        return new WandBuilder(this.input, builder);
    }
}
