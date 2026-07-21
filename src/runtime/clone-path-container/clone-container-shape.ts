import {
    createSparseDataArray,
    isUnknownArray,
} from '../../internal/type-boundary/array.js';
import {
    createDataRecord,
    getObjectPrototype,
} from '../../internal/type-boundary/record.js';
import type { PathContainer } from '../path-container/container-types.js';

export function cloneContainerShape(container: PathContainer): PathContainer {
    return isUnknownArray(container)
        ? createSparseDataArray(container.length)
        : createDataRecord(getObjectPrototype(container));
}

export function parseArrayIndex(key: string): number | undefined {
    const value = Number(key);
    return Number.isSafeInteger(value)
        && value >= 0
        && value < 4_294_967_295
        && String(value) === key
        ? value
        : undefined;
}
