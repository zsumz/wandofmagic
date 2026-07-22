import type {
    CopyConflictPolicy,
    CopyOptions,
    MissingPolicy,
} from '../../core/plan/operation-options.js';
import type { PathInput } from '../../core/path/path.js';
import { createCopyStep } from '../../operations/path/copy/create-copy-step.js';
import type {
    BuilderCopyProgram,
    BuilderCopySourceInput,
} from '../../types/builder/copy-output.js';
import type { SafePathInput } from '../../types/path/input.js';
import type { PathTypeOperation } from '../../types/path-program/operation.js';
import type { BuilderState } from '../state/builder-state.js';
import { CoerceSpellBuilder } from './coerce-spell-builder.js';
import type { SpellBuilder } from './spell-builder.js';

/** Fluent copy operation shared by the remaining immutable builder layers. */
export abstract class CopySpellBuilder<
    Input extends object,
    Current extends object,
    Program extends readonly PathTypeOperation[],
> extends CoerceSpellBuilder<Input, Current, Program> {
    /** Copy a value to another safe path without removing its source. */
    public copy<
        const Source extends PathInput,
        const Destination extends PathInput,
        const Missing extends MissingPolicy = 'error',
        const Conflict extends CopyConflictPolicy = 'error',
    >(
        source: BuilderCopySourceInput<Current, Program, Source>,
        destination: Destination & SafePathInput<NoInfer<Destination>>,
        options: CopyOptions<Missing, Conflict> = {},
    ): SpellBuilder<Input, Current, BuilderCopyProgram<
        Current, Program, Source, Destination, Missing, Conflict
    >> {
        const id = this.nextId('copy', options.id);
        return this.append<Current, BuilderCopyProgram<
            Current, Program, Source, Destination, Missing, Conflict
        >>(createCopyStep(
            source,
            destination,
            options.missing ?? 'error',
            options.conflict ?? 'error',
            id,
        ));
    }

    protected abstract override rebuild<
        Next extends object,
        NextProgram extends readonly PathTypeOperation[],
    >(state: BuilderState): SpellBuilder<Input, Next, NextProgram>;
}
