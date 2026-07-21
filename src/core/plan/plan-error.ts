export type PlanErrorCode =
    | 'dangerous_key'
    | 'duplicate_dependency'
    | 'duplicate_destination'
    | 'duplicate_step_id'
    | 'empty_operation'
    | 'invalid_path'
    | 'invalid_step_id'
    | 'path_too_deep';

/** Thrown while constructing an invalid transformation plan. */
export class PlanError extends Error {
    public readonly code: PlanErrorCode;

    constructor(code: PlanErrorCode, message: string) {
        super(message);
        this.name = 'PlanError';
        this.code = code;
    }
}
