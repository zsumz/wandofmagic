import { SpellBuilder } from '../spell/spell-builder.js';
import { WandBuilder } from './wand-builder.js';

/** Start a one-off transformation bound to a value. */
export function wand<Input extends object>(input: Input): WandBuilder<Input, Input> {
    return new WandBuilder(input, SpellBuilder.create<Input>());
}
