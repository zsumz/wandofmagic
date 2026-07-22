import type { StepOptions } from '../../core/plan/operation-options.js';
import { createPickStep } from '../../operations/path/pick/create-pick-step.js';
import type { BuilderOutput } from '../../types/builder/field-output.js';
import type {
    BuilderPickInput,
    BuilderPickOutput,
    BuilderPickPaths,
} from '../../types/builder/pick-output.js';
import type { PathTypeOperation } from '../../types/path-program/operation.js';
import type { BuilderState } from '../state/builder-state.js';
import { CopySpellBuilder } from './copy-spell-builder.js';
import type { SpellBuilder } from './spell-builder.js';

/** Fluent projection operation shared by the remaining immutable builder layers. */
export abstract class PickSpellBuilder<
    Input extends object,
    Current extends object,
    Program extends readonly PathTypeOperation[],
> extends CopySpellBuilder<Input, Current, Program> {
    /** Retain only the selected paths and their required containers. */
    public pick<const Paths extends BuilderPickPaths>(
        paths: Paths & BuilderPickInput<BuilderOutput<Current, Program>, NoInfer<Paths>>,
        options: StepOptions = {},
    ): SpellBuilder<Input, BuilderPickOutput<BuilderOutput<Current, Program>, Paths>> {
        const id = this.nextId('pick', options.id);
        return this.append<BuilderPickOutput<BuilderOutput<Current, Program>, Paths>>(
            createPickStep(paths, id),
        );
    }

    protected abstract override rebuild<
        Next extends object,
        NextProgram extends readonly PathTypeOperation[],
    >(state: BuilderState): SpellBuilder<Input, Next, NextProgram>;
}
