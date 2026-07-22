import type { StepOptions } from '../../core/plan/operation-options.js';
import type { PathInput } from '../../core/path/path.js';
import { invokeBuilderTrim } from '../../internal/type-boundary/builder.js';
import type {
    BuilderOutput,
    BuilderTrimKey,
} from '../../types/builder/field-output.js';
import type {
    BuilderPathTrimInput,
    BuilderPathTrimPaths,
} from '../../types/builder/trim-output.js';
import type { PathTypeOperation } from '../../types/path-program/operation.js';
import type { SpellBuilder } from '../spell/spell-builder.js';
import { PickWandBuilder } from './pick-wand-builder.js';
import type { WandBuilder } from './wand-builder.js';

/** Flat and deep trim operations shared by the remaining wand builder layers. */
export abstract class TrimWandBuilder<
    Input extends object,
    Current extends object,
    Program extends readonly PathTypeOperation[],
> extends PickWandBuilder<Input, Current, Program> {
    public trim<const Paths extends BuilderPathTrimPaths>(
        paths: Paths & BuilderPathTrimInput<Current, Program, NoInfer<Paths>>,
        options?: StepOptions,
    ): WandBuilder<Input, Current, Program>;
    public trim(
        keys: ReadonlyArray<BuilderTrimKey<BuilderOutput<Current, Program>>>,
        options?: StepOptions,
    ): WandBuilder<Input, BuilderOutput<Current, Program>>;
    public trim(paths: readonly PathInput[], options: StepOptions = {}): unknown {
        const next = invokeBuilderTrim<SpellBuilder<
            Input, object, readonly PathTypeOperation[]
        >>(this.builder, paths, options);
        return this.rebuild<object, readonly PathTypeOperation[]>(next);
    }

    protected abstract override rebuild<
        Next extends object,
        NextProgram extends readonly PathTypeOperation[],
    >(builder: SpellBuilder<Input, Next, NextProgram>): WandBuilder<Input, Next, NextProgram>;
}
