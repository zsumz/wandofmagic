const itemSpells: WeakMap<object, object> = new WeakMap();

export function registerCollectionItemSpell(owner: object, itemSpell: object): void {
    itemSpells.set(owner, itemSpell);
}

export function getCollectionItemSpell(owner: object): object | undefined {
    return itemSpells.get(owner);
}
