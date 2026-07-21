import { CompilerError } from '../error/compiler-error.js';

export function throwUnsupportedProgram(message: string): never {
    throw new CompilerError('unsupported_program', message);
}
