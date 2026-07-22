import { createSpellDescription } from '../../core/plan/create-spell-description.js';
import type { SpellDescription } from '../../core/plan/description-types.js';
import type { ExecutableStep } from '../../core/plan/executable-step.js';
import type { RunOptions } from '../../core/execution/run-options.js';
import type { SpellOptions } from '../../core/plan/spell-options.js';
import type { WandResult } from '../../core/execution/result.js';
import type { Spell } from '../../core/execution/spell.js';
import { compileFlatProgram } from './compile-flat-program.js';
import { compilePlan, type CompiledPlan } from './compile-plan.js';
import { registerFlatProgram } from './flat-program-registry.js';
import { registerOperationProgram } from './operation-program-registry.js';
import { executePlan } from '../execute-plan/execute-plan.js';
import { runPlan } from '../execute-plan/run-plan.js';

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
        registerOperationProgram(
            this,
            Object.freeze(frozenSteps.map((step) => step.instruction)),
        );
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
