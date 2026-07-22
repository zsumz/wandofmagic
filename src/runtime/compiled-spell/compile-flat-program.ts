import type { ExecutableStep } from '../../core/plan/executable-step.js';
import type { FlatProgram } from '../../instructions/flat/flat-operation.js';

/** Capture the operation-owned instruction sequence for later static specialization. */
export function compileFlatProgram(steps: readonly ExecutableStep[]): FlatProgram | undefined {
    const instructions = steps.map((step) => step.instruction);
    if (instructions.some((instruction) =>
        instruction.kind === 'coerce-path' || instruction.kind === 'copy' ||
        instruction.kind === 'default-path' || instruction.kind === 'move' ||
        instruction.kind === 'omit-paths' || instruction.kind === 'pick' ||
        instruction.kind === 'set' ||
        instruction.kind === 'transform-path')) {
        return undefined;
    }
    return Object.freeze(instructions.filter((instruction) =>
        instruction.kind !== 'coerce-path' && instruction.kind !== 'copy' &&
        instruction.kind !== 'default-path' && instruction.kind !== 'move' &&
        instruction.kind !== 'omit-paths' && instruction.kind !== 'pick' &&
        instruction.kind !== 'set' &&
        instruction.kind !== 'transform-path'));
}
