import type {
    MapperBindingDescription,
    MapperBindingKind,
} from '../trusted-mapper/emitted-mapper.js';

export interface EmitterState {
    readonly bindingDescriptions: MapperBindingDescription[];
    readonly bindings: unknown[];
}

export function createEmitterState(): EmitterState {
    return { bindingDescriptions: [], bindings: [] };
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
