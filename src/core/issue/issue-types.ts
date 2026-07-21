import type { FieldPath } from '../path/path.js';
import type { StepKind } from '../plan/step-kind.js';

/** Stable issue codes form part of the public API. */
export type WandIssueCode =
    | 'coercion_failed'
    | 'destination_conflict'
    | 'invalid_input'
    | 'missing_field'
    | 'transform_failed'
    | 'unexpected_type'
    | 'unsupported_accessor';

export interface IssueStep {
    readonly id: string;
    readonly kind: StepKind;
}

/** A structured execution failure. */
export interface WandIssue {
    readonly cause?: unknown;
    readonly code: WandIssueCode;
    readonly details?: Readonly<Record<string, unknown>>;
    readonly message: string;
    readonly path?: FieldPath;
    readonly step?: IssueStep;
}

export interface CreateIssueInput extends Omit<WandIssue, 'cause'> {
    readonly cause?: unknown;
}
