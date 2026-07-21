import type { Coercer } from '../../coerce/types.js';
import type { ExecutableStep } from '../../core/plan/executable-step.js';
import type {
    MissingOptions,
    MissingPolicy,
} from '../../core/plan/operation-options.js';
import type {
    Path,
    PathInput,
} from '../../core/path/path.js';
import type {
    BuilderCoerceKey,
    BuilderCoerceOutput,
    BuilderOutput,
} from '../../types/builder/field-output.js';
import type {
    BuilderPathCoerceInput,
    BuilderPathCoerceProgram,
} from '../../types/builder/transform-output.js';
import type { PathTypeOperation } from '../../types/path-program/operation.js';
import type { BuilderState } from '../state/builder-state.js';
import { createCoerceDispatchStep } from './operation-dispatch/coerce-step.js';
import type { SpellBuilder } from './spell-builder.js';

/** Fluent coercion operations shared by the remaining immutable builder layers. */
export abstract class CoerceSpellBuilder<
    Input extends object,
    Current extends object,
    Program extends readonly PathTypeOperation[],
> {
    protected constructor(protected readonly state: BuilderState) {}

    /** Coerce a safe tuple path or top-level field with explicit missing-value semantics. */
    public coerce<
        const CoercerValue extends Coercer<unknown, unknown>,
        const OperationPath extends Path,
        const Policy extends MissingPolicy = 'error',
    >(
        path: BuilderPathCoerceInput<Current, Program, OperationPath, CoercerValue>,
        coercer: CoercerValue,
        options?: MissingOptions<Policy>,
    ): SpellBuilder<Input, Current, BuilderPathCoerceProgram<
        Program, OperationPath, CoercerValue, Policy
    >>;
    public coerce<
        const CoercerValue extends Coercer<unknown, unknown>,
        const Key extends BuilderCoerceKey<BuilderOutput<Current, Program>, CoercerValue>,
        const Policy extends MissingPolicy = 'error',
    >(
        key: Key,
        coercer: CoercerValue,
        options?: MissingOptions<Policy>,
    ): SpellBuilder<Input, BuilderCoerceOutput<
        BuilderOutput<Current, Program>, Key, CoercerValue, Policy
    >>;
    public coerce(
        path: PathInput,
        coercer: Coercer<unknown, unknown>,
        options: MissingOptions<MissingPolicy> = {},
    ): unknown {
        const missing = options.missing ?? 'error';
        const id = this.nextId('coerce', options.id);
        return this.append<object, readonly PathTypeOperation[]>(
            createCoerceDispatchStep(path, coercer, missing, id),
        );
    }

    protected append<
        Next extends object,
        NextProgram extends readonly PathTypeOperation[] = readonly [],
    >(step: ExecutableStep): SpellBuilder<Input, Next, NextProgram> {
        return this.rebuild<Next, NextProgram>(this.state.append(step));
    }

    protected nextId(kind: ExecutableStep['kind'], requested: string | undefined): string {
        return this.state.nextId(kind, requested);
    }

    protected abstract rebuild<
        Next extends object,
        NextProgram extends readonly PathTypeOperation[],
    >(state: BuilderState): SpellBuilder<Input, Next, NextProgram>;
}
