import type { StepOptions } from '../../core/plan/operation-options.js';
import type { PathInput } from '../../core/path/path.js';
import type {
    BuilderOutput,
    BuilderTrimKey,
} from '../../types/builder/field-output.js';
import type {
    BuilderPathTrimInput,
    BuilderPathTrimPaths,
} from '../../types/builder/trim-output.js';
import type { PathTypeOperation } from '../../types/path-program/operation.js';
import type { BuilderState } from '../state/builder-state.js';
import { createTrimDispatchStep } from './operation-dispatch/trim-step.js';
import { PickSpellBuilder } from './pick-spell-builder.js';
import type { SpellBuilder } from './spell-builder.js';

/** Flat and deep trim operations shared by the remaining immutable builder layers. */
export abstract class TrimSpellBuilder<
    Input extends object,
    Current extends object,
    Program extends readonly PathTypeOperation[],
> extends PickSpellBuilder<Input, Current, Program> {
    public trim<const Paths extends BuilderPathTrimPaths>(
        paths: Paths & BuilderPathTrimInput<Current, Program, NoInfer<Paths>>,
        options?: StepOptions,
    ): SpellBuilder<Input, Current, Program>;
    public trim(
        keys: ReadonlyArray<BuilderTrimKey<BuilderOutput<Current, Program>>>,
        options?: StepOptions,
    ): SpellBuilder<Input, BuilderOutput<Current, Program>>;
    public trim(paths: readonly PathInput[], options: StepOptions = {}): unknown {
        const id = this.nextId('trim', options.id);
        return this.append<object, readonly PathTypeOperation[]>(
            createTrimDispatchStep(paths, id),
        );
    }

    protected abstract override rebuild<
        Next extends object,
        NextProgram extends readonly PathTypeOperation[],
    >(state: BuilderState): SpellBuilder<Input, Next, NextProgram>;
}
