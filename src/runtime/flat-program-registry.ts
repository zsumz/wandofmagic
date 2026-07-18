import type { FlatProgram } from '../instructions/flat-operation.js';

const flatPrograms: WeakMap<object, FlatProgram> = new WeakMap();

/** Retain compiler metadata without adding fields to the interpreter's hot plan object. */
export function registerFlatProgram(owner: object, program: FlatProgram): void {
    flatPrograms.set(owner, program);
}

/** Resolve the private flat program for a future compiler entrypoint. */
export function getFlatProgram(owner: object): FlatProgram | undefined {
    return flatPrograms.get(owner);
}
