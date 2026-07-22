import { WandError } from '../../core/execution/wand-error.js';
import type { RunOptions } from '../../core/execution/run-options.js';
import type { WandResult } from '../../core/execution/result.js';
import type { Spell } from '../../core/execution/spell.js';
import type { SpellDescription } from '../../core/plan/description-types.js';
import { executeCollection } from './execute-collection.js';

/** A reusable root-array transformation driven by one item spell. */
export class CollectionSpell<Input extends object, Output extends object>
implements Spell<readonly Input[], Output[]> {
    constructor(private readonly itemSpell: Spell<Input, Output>) {}

    /** Return the static, value-free plan applied to each present item. */
    public describe(): SpellDescription {
        return this.itemSpell.describe();
    }

    public run(input: readonly Input[], options?: RunOptions): Output[] {
        const result = this.safeRun(input, options);
        if (!result.ok) {
            throw new WandError(result);
        }
        return result.value;
    }

    public safeRun(input: readonly Input[], options?: RunOptions): WandResult<Output[]> {
        return executeCollection(input, this.itemSpell, options);
    }
}
