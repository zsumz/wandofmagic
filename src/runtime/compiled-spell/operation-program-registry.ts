import type { OperationInstruction } from '../../instructions/path/path-operation.js';

export type OperationProgram = readonly OperationInstruction[];

const programs: WeakMap<object, OperationProgram> = new WeakMap();

export function registerOperationProgram(
    spell: object,
    program: OperationProgram,
): void {
    programs.set(spell, program);
}

export function getOperationProgram(
    spell: object,
): OperationProgram | undefined {
    return programs.get(spell);
}
