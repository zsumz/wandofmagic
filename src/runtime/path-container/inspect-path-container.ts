import type { FieldPath } from '../../core/path/path.js';
import { isUnknownArray } from '../../internal/type-boundary/array.js';
import {
    castInputRecord,
    getObjectPrototype,
} from '../../internal/type-boundary/record.js';
import { failedContainerInspection, unexpectedContainer } from './container-issues.js';
import type { ContainerInspection } from './container-types.js';

const objectPrototype = Object.prototype;

/** Accept only containers the deep runtime can traverse without invoking application behavior. */
export function inspectPathContainer(
    value: unknown,
    path: FieldPath,
    prefixLength: number,
): ContainerInspection {
    if (isUnknownArray(value)) {
        return { ok: true, value };
    }
    if (typeof value !== 'object' || value === null) {
        return unexpectedContainer(path, prefixLength);
    }
    try {
        const prototype = getObjectPrototype(value);
        if (prototype === objectPrototype || prototype === null) {
            return { ok: true, value: castInputRecord(value) };
        }
        return unexpectedContainer(path, prefixLength);
    } catch (cause) {
        return failedContainerInspection(path, prefixLength, cause);
    }
}
