export type CompilerErrorCode =
    | 'unsupported_program'
    | 'unsupported_spell';

/** Thrown when a spell cannot be represented by the static trusted mapper emitter. */
export class CompilerError extends Error {
    public readonly code: CompilerErrorCode;

    constructor(code: CompilerErrorCode, message: string) {
        super(message);
        this.name = 'CompilerError';
        this.code = code;
    }
}
