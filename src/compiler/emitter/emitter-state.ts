import type {
    MapperBindingDescription,
    MapperBindingKind,
} from '../trusted-mapper/emitted-mapper.js';
import type { FieldPath } from '../../core/path/path.js';

export interface EmitterState {
    readonly bindingDescriptions: MapperBindingDescription[];
    readonly bindings: unknown[];
    readonly pathIndexes: Map<string, number>;
    readonly paths: FieldPath[];
    readonly readPathIndexes: Set<number>;
}

export function createEmitterState(): EmitterState {
    return {
        bindingDescriptions: [],
        bindings: [],
        pathIndexes: new Map(),
        paths: [],
        readPathIndexes: new Set(),
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
