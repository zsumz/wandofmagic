import type { DataRecord } from '../../core/execution/data-record.js';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- The caller selects the compiled spell's output type.
export function castOutput<Output extends object>(value: DataRecord): Output {
    return value as unknown as Output;
}

export function createDataRecord(prototype: object | null): DataRecord {
    // Use the ordinary object allocation path unless the caller explicitly needs a null prototype.
    if (prototype === Object.prototype) {
        return {};
    }

    return Object.create(prototype) as DataRecord;
}

export function getObjectPrototype(value: object): object | null {
    return Object.getPrototypeOf(value) as object | null;
}

export function getDataPropertyValue(descriptor: PropertyDescriptor): unknown {
    return descriptor.value as unknown;
}

export function castInputRecord(value: object): DataRecord {
    return value as DataRecord;
}
