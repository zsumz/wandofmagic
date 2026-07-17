import type { FieldPath } from './path.js';

interface BaseChange {
    readonly stepId: string;
}

interface RenameChange extends BaseChange {
    readonly kind: 'rename';
    readonly from: FieldPath;
    readonly to: FieldPath;
}

interface MoveChange extends BaseChange {
    readonly kind: 'move';
    readonly from: FieldPath;
    readonly to: FieldPath;
}

interface TrimChange extends BaseChange {
    readonly kind: 'trim';
    readonly path: FieldPath;
}

interface CoerceChange extends BaseChange {
    readonly kind: 'coerce';
    readonly coercer: string;
    readonly fromType: string;
    readonly path: FieldPath;
    readonly toType: string;
}

interface DefaultChange extends BaseChange {
    readonly kind: 'default';
    readonly path: FieldPath;
}

interface DeriveChange extends BaseChange {
    readonly kind: 'derive';
    readonly path: FieldPath;
    readonly sources: readonly FieldPath[];
}

interface OmitChange extends BaseChange {
    readonly kind: 'omit';
    readonly path: FieldPath;
}

interface SetChange extends BaseChange {
    readonly kind: 'set';
    readonly path: FieldPath;
}

interface TransformChange extends BaseChange {
    readonly kind: 'transform';
    readonly path: FieldPath;
}

/** A privacy-safe receipt entry. Raw field values are never included. */
export type WandChange =
    | CoerceChange
    | DefaultChange
    | DeriveChange
    | MoveChange
    | OmitChange
    | RenameChange
    | SetChange
    | TransformChange
    | TrimChange;

export function freezeChange(change: WandChange): WandChange {
    if (change.kind === 'derive') {
        return Object.freeze({
            ...change,
            sources: Object.freeze([...change.sources]),
        });
    }

    return Object.freeze({ ...change });
}

/** Freeze the runtime-owned receipt array after operations have frozen their own entries. */
export function freezeChanges(changes: WandChange[]): readonly WandChange[] {
    return Object.freeze(changes);
}
