import type { Spell } from '../../core/execution/spell.js';
import { CollectionSpell } from '../../runtime/collection/collection-spell.js';

/** Apply one reusable spell independently to every present item in a root array. */
export function collection<Input extends object, Output extends object>(
    itemSpell: Spell<Input, Output>,
): Spell<readonly Input[], Output[]> {
    return new CollectionSpell(itemSpell);
}
