import type { ExecutableStep } from '../../core/plan/executable-step.js';
import type { SpellOptions } from '../../core/plan/spell-options.js';
import { assertUniqueStepId, resolveStepId } from './step-id.js';

/** Runtime state shared by immutable fluent builder generations. */
export class BuilderState {
    public readonly metadata: SpellOptions;
    public readonly steps: readonly ExecutableStep[];

    private constructor(steps: readonly ExecutableStep[], metadata: SpellOptions) {
        this.steps = steps;
        this.metadata = metadata;
    }

    public static create(options: SpellOptions): BuilderState {
        return new BuilderState([], Object.freeze({ ...options }));
    }

    public append(step: ExecutableStep): BuilderState {
        assertUniqueStepId(this.steps, step.id);
        return new BuilderState(Object.freeze([...this.steps, step]), this.metadata);
    }

    public nextId(kind: ExecutableStep['kind'], requested: string | undefined): string {
        return resolveStepId(kind, requested, this.steps.length + 1);
    }
}
