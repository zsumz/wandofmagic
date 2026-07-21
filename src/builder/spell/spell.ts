import type { SpellOptions } from '../../core/plan/spell-options.js';
import { SpellBuilder } from './spell-builder.js';

/** Start a reusable, immutable transformation plan. */
export function spell<Input extends object>(
    options: SpellOptions = {},
): SpellBuilder<Input, Input> {
    return SpellBuilder.create<Input>(options);
}
