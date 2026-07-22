import type {
    MapperBindingDescription,
    MapperBindingKind,
} from '../trusted-mapper/emitted-mapper.js';
import type { FieldPath } from '../../core/path/path.js';

export interface ActiveReadPrefix {
    readonly index: number;
    readonly path: FieldPath;
    readonly variable: string;
}

export interface ReadPathProgram {
    readonly pathIndex: number;
    readonly prefixIndex?: number;
}

export interface EmitterState {
    activeReadPrefixes: readonly ActiveReadPrefix[];
    readonly bindingDescriptions: MapperBindingDescription[];
    readonly bindings: unknown[];
    readonly pathIndexes: Map<string, number>;
    readonly paths: FieldPath[];
    readonly readPathPrograms: Map<string, ReadPathProgram>;
    readonly readPrefixIndexes: Set<number>;
}

export function createEmitterState(): EmitterState {
    return {
        activeReadPrefixes: [],
        bindingDescriptions: [],
        bindings: [],
        pathIndexes: new Map(),
        paths: [],
        readPathPrograms: new Map(),
        readPrefixIndexes: new Set(),
    };
}

export function addBinding(
    state: EmitterState,
    value: unknown,
    kind: MapperBindingKind,
    stepId: string,
): string {
    const index = state.bindings.length;
    state.bindings.push(value);
    state.bindingDescriptions.push(Object.freeze({ index, kind, stepId }));
    return `$binding${String(index)}`;
}
