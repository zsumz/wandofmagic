import type {
    CopyConflictPolicy,
    CopyOptions,
    MissingPolicy,
} from '../../core/plan/operation-options.js';
import type { PathInput } from '../../core/path/path.js';
import type {
    BuilderCopyProgram,
    BuilderCopySourceInput,
} from '../../types/builder/copy-output.js';
import type { SafePathInput } from '../../types/path/input.js';
import type { PathTypeOperation } from '../../types/path-program/operation.js';
import type { SpellBuilder } from '../spell/spell-builder.js';
import { CoerceWandBuilder } from './coerce-wand-builder.js';
import type { WandBuilder } from './wand-builder.js';

/** One-off copy operation shared by the remaining wand builder layers. */
export abstract class CopyWandBuilder<
    Input extends object,
    Current extends object,
    Program extends readonly PathTypeOperation[],
> extends CoerceWandBuilder<Input, Current, Program> {
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
    ): WandBuilder<Input, Current, BuilderCopyProgram<
        Current, Program, Source, Destination, Missing, Conflict
    >> {
        return this.rebuild(this.builder.copy<Source, Destination, Missing, Conflict>(
            source,
            destination,
            options,
        ));
    }

    protected abstract override rebuild<
        Next extends object,
        NextProgram extends readonly PathTypeOperation[],
    >(builder: SpellBuilder<Input, Next, NextProgram>): WandBuilder<Input, Next, NextProgram>;
}
