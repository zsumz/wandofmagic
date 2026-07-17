import type { WandChange } from './change.js';
import type { WandIssue } from './issue.js';
import type { FieldPath } from './path.js';

export interface RenameProjectionEntry {
    readonly change: WandChange;
    readonly conflictIssue: WandIssue;
    readonly destination: string;
    readonly destinationPath: FieldPath;
    readonly source: string;
}

export interface RenameProjectionStep {
    readonly entries: readonly RenameProjectionEntry[];
    readonly hasOverlappingMoves: boolean;
    readonly kind: 'rename';
}

export interface OmitProjectionField {
    readonly change: WandChange;
    readonly key: string;
}

export interface OmitProjectionStep {
    readonly fields: readonly OmitProjectionField[];
    readonly kind: 'omit';
}

export type ProjectionStep = OmitProjectionStep | RenameProjectionStep;
