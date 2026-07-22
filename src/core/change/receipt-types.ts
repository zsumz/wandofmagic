import type { DataPath } from '../path/path.js';

interface BaseChange {
    readonly stepId: string;
}

interface RenameChange extends BaseChange {
    readonly kind: 'rename';
    readonly from: DataPath;
    readonly to: DataPath;
}

interface MoveChange extends BaseChange {
    readonly kind: 'move';
    readonly from: DataPath;
    readonly to: DataPath;
}

interface CopyChange extends BaseChange {
    readonly kind: 'copy';
    readonly from: DataPath;
    readonly to: DataPath;
}

interface TrimChange extends BaseChange {
    readonly kind: 'trim';
    readonly path: DataPath;
}

interface CoerceChange extends BaseChange {
    readonly kind: 'coerce';
    readonly coercer: string;
    readonly fromType: string;
    readonly path: DataPath;
    readonly toType: string;
}

interface DefaultChange extends BaseChange {
    readonly kind: 'default';
    readonly path: DataPath;
}

interface DeriveChange extends BaseChange {
    readonly kind: 'derive';
    readonly path: DataPath;
    readonly sources: readonly DataPath[];
}

interface OmitChange extends BaseChange {
    readonly kind: 'omit';
    readonly path: DataPath;
}

interface PickChange extends BaseChange {
    readonly kind: 'pick';
    readonly paths: readonly DataPath[];
}

interface SetChange extends BaseChange {
    readonly kind: 'set';
    readonly path: DataPath;
}

interface TransformChange extends BaseChange {
    readonly kind: 'transform';
    readonly path: DataPath;
}

/** A privacy-safe receipt entry. Raw field values are never included. */
export type WandChange =
    | CoerceChange
    | CopyChange
    | DefaultChange
    | DeriveChange
    | MoveChange
    | OmitChange
    | PickChange
    | RenameChange
    | SetChange
    | TransformChange
    | TrimChange;
