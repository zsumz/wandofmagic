import type { Coercer } from '../coerce/types.js';
import type { MissingOptions, MissingPolicy, RunOptions } from '../core/options.js';
import type { Path, PathInput } from '../core/path.js';
import type { WandResult } from '../core/result.js';
import type { Spell } from '../core/spell.js';
import { invokeBuilderCoerce } from '../internal/type-boundary.js';
import type {
    BuilderCoerceKey,
    BuilderCoerceOutput,
    BuilderOutput,
} from '../types/builder-output.js';
import type {
    BuilderPathCoerceInput,
    BuilderPathCoerceProgram,
} from '../types/path-builder-output.js';
import type { PathTypeOperation } from '../types/path-program-operation.js';
import type { SpellBuilder } from './spell-builder.js';
import type { WandBuilder } from './wand-builder.js';

/** One-off coercion operations shared by the remaining wand builder layers. */
export abstract class CoerceWandBuilder<
    Input extends object,
    Current extends object,
    Program extends readonly PathTypeOperation[],
> {
    constructor(
        protected readonly input: Input,
        protected readonly builder: SpellBuilder<Input, Current, Program>,
    ) {}

    /** Coerce a safe tuple path or top-level field with explicit missing-value semantics. */
    public coerce<
        const CoercerValue extends Coercer<unknown, unknown>,
        const OperationPath extends Path,
        const Policy extends MissingPolicy = 'error',
    >(
        path: BuilderPathCoerceInput<Current, Program, OperationPath, CoercerValue>,
        coercer: CoercerValue,
        options?: MissingOptions<Policy>,
    ): WandBuilder<Input, Current, BuilderPathCoerceProgram<
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
    ): WandBuilder<Input, BuilderCoerceOutput<
        BuilderOutput<Current, Program>, Key, CoercerValue, Policy
    >>;
    public coerce(
        path: PathInput,
        coercer: Coercer<unknown, unknown>,
        options: MissingOptions<MissingPolicy> = {},
    ): unknown {
        const next = invokeBuilderCoerce<SpellBuilder<
            Input, object, readonly PathTypeOperation[]
        >>(this.builder, path, coercer, options);
        return this.rebuild<object, readonly PathTypeOperation[]>(next);
    }

    /** Compile the accumulated one-off plan for reuse. */
    public build(): Spell<Input, BuilderOutput<Current, Program>> {
        return this.builder.build();
    }

    /** Execute safely and return a discriminated result with an optional receipt policy. */
    public result(options?: RunOptions): WandResult<BuilderOutput<Current, Program>> {
        return this.build().safeRun(this.input, options);
    }

    /** Execute and throw `WandError` on failure. */
    public value(options?: RunOptions): BuilderOutput<Current, Program> {
        return this.build().run(this.input, options);
    }

    protected abstract rebuild<
        Next extends object,
        NextProgram extends readonly PathTypeOperation[],
    >(builder: SpellBuilder<Input, Next, NextProgram>): WandBuilder<Input, Next, NextProgram>;
}
