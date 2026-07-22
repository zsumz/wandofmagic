import type {
    MapperBindingDescription,
    MapperBindingKind,
} from '../trusted-mapper/emitted-mapper.js';
import type { FieldPath } from '../../core/path/path.js';

export interface EmitterState {
    readonly bindingDescriptions: MapperBindingDescription[];
    readonly bindings: unknown[];
    readonly pathGroups: number[][];
    readonly pathGroupIndexes: Map<string, number>;
    readonly pathIndexes: Map<string, number>;
    readonly paths: FieldPath[];
}

export function createEmitterState(): EmitterState {
    return {
        bindingDescriptions: [],
        bindings: [],
        pathGroupIndexes: new Map(),
        pathGroups: [],
        pathIndexes: new Map(),
        paths: [],
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
