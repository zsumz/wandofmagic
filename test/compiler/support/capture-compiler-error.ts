import { CompilerError } from '../../../src/compiler/error/compiler-error.js';

export function captureCompilerError(run: () => unknown): CompilerError {
    try {
        run();
    } catch (error) {
        if (error instanceof CompilerError) {
            return error;
        }
        throw error;
    }
    throw new Error('Expected static mapper emission to fail.');
}
