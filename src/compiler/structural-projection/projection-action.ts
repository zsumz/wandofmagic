import type { ProjectedRename } from './projected-rename.js';

export interface ProjectionAction {
    destinationIndex: number;
    omitted: boolean;
    sourceIndex: number;
}

export function compileProjectionActions(
    entries: readonly ProjectedRename[],
    omittedKeys: ReadonlySet<string>,
): ReadonlyMap<string, ProjectionAction> {
    const actions: Map<string, ProjectionAction> = new Map();
    for (const entry of entries) {
        actionFor(actions, entry.source).sourceIndex = entry.index;
        actionFor(actions, entry.destination).destinationIndex = entry.index;
    }
    for (const key of omittedKeys) {
        actionFor(actions, key).omitted = true;
    }
    return actions;
}

function actionFor(
    actions: Map<string, ProjectionAction>,
    key: string,
): ProjectionAction {
    const existing = actions.get(key);
    if (existing !== undefined) {
        return existing;
    }
    const created = { destinationIndex: -1, omitted: false, sourceIndex: -1 };
    actions.set(key, created);
    return created;
}
