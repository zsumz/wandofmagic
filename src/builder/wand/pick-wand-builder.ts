import type { StepOptions } from '../../core/plan/operation-options.js';
import { invokeBuilderPick } from '../../internal/type-boundary/builder.js';
import type { BuilderOutput } from '../../types/builder/field-output.js';
import type {
    BuilderPickInput,
    BuilderPickOutput,
    BuilderPickPaths,
} from '../../types/builder/pick-output.js';
import type { PathTypeOperation } from '../../types/path-program/operation.js';
import type { SpellBuilder } from '../spell/spell-builder.js';
import { CopyWandBuilder } from './copy-wand-builder.js';
import type { WandBuilder } from './wand-builder.js';

/** One-off projection operation shared by the remaining wand builder layers. */
export abstract class PickWandBuilder<
    Input extends object,
    Current extends object,
    Program extends readonly PathTypeOperation[],
> extends CopyWandBuilder<Input, Current, Program> {
    /** Retain only the selected paths and their required containers. */
    public pick<const Paths extends BuilderPickPaths>(
        paths: Paths & BuilderPickInput<BuilderOutput<Current, Program>, NoInfer<Paths>>,
        options: StepOptions = {},
    ): WandBuilder<Input, BuilderPickOutput<BuilderOutput<Current, Program>, Paths>> {
        const next = invokeBuilderPick<SpellBuilder<
            Input,
            BuilderPickOutput<BuilderOutput<Current, Program>, Paths>
        >>(this.builder, paths, options);
        return this.rebuild(next);
    }

    protected abstract override rebuild<
        Next extends object,
        NextProgram extends readonly PathTypeOperation[],
    >(builder: SpellBuilder<Input, Next, NextProgram>): WandBuilder<Input, Next, NextProgram>;
}
