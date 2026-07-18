import { createSpellDescription, type SpellDescription } from '../core/description.js';
import type { ExecutableStep } from '../core/executable-step.js';
import type { RunOptions, SpellOptions } from '../core/options.js';
import type { WandResult } from '../core/result.js';
import type { Spell } from '../core/spell.js';
import { compileFlatProgram } from './compile-flat-program.js';
import { compilePlan, type CompiledPlan } from './compile-plan.js';
import { executePlan, runPlan } from './execute-plan.js';
import { registerFlatProgram } from './flat-program-registry.js';

export class CompiledSpell<Input extends object, Output extends object>
implements Spell<Input, Output> {
    readonly #description: SpellDescription;
    readonly #plan: CompiledPlan;

    constructor(steps: readonly ExecutableStep[], metadata: SpellOptions) {
        const frozenSteps = Object.freeze([...steps]);
        this.#plan = compilePlan(frozenSteps);
        const flatProgram = compileFlatProgram(frozenSteps);
        if (flatProgram !== undefined) {
            registerFlatProgram(this, flatProgram);
        }
        this.#description = createSpellDescription(
            metadata,
            frozenSteps.map((step) => step.describe()),
        );
    }

    public describe(): SpellDescription {
        return this.#description;
    }

    public run(input: Input, options?: RunOptions): Output {
        return runPlan<Output>(input, this.#plan, options);
    }

    public safeRun(input: Input, options?: RunOptions): WandResult<Output> {
        return executePlan<Output>(input, this.#plan, options);
    }
}
