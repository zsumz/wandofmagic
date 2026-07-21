import type { ExecutableStep } from '../../../src/core/plan/executable-step.js';
import type { FlatProgram } from '../../../src/instructions/flat/flat-operation.js';
import { compileFlatProgram } from '../../../src/runtime/compiled-spell/compile-flat-program.js';

export function requireFlatProgram(steps: readonly ExecutableStep[]): FlatProgram {
    const program = compileFlatProgram(steps);
    if (program === undefined) {
        throw new Error('Expected a flat instruction fixture.');
    }
    return program;
}
