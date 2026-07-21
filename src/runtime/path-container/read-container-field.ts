import type {
    FieldPath,
    PathSegment,
} from '../../core/path/path.js';
import { isUnknownArray } from '../../internal/type-boundary/array.js';
import { getDataPropertyValue } from '../../internal/type-boundary/record.js';
import {
    failedContainerInspection,
    unexpectedPathSegment,
    unsupportedContainerAccessor,
} from './container-issues.js';
import type { ContainerRead, PathContainer } from './container-types.js';

/** Read one own enumerable data property from a previously inspected container. */
export function readContainerField(
    container: PathContainer,
    segment: PathSegment,
    path: FieldPath,
    prefixLength: number,
): ContainerRead {
    const arrayContainer = isUnknownArray(container);
    if (arrayContainer ? typeof segment !== 'number' : typeof segment !== 'string') {
        return unexpectedPathSegment(path, prefixLength, arrayContainer);
    }

    let descriptor: PropertyDescriptor | undefined;
    try {
        descriptor = Object.getOwnPropertyDescriptor(container, segment);
    } catch (cause) {
        return {
            issue: failedContainerInspection(path, prefixLength, cause).issue,
            status: 'failed',
        };
    }
    if (descriptor?.enumerable !== true) {
        return { status: 'missing' };
    }
    if (!('value' in descriptor)) {
        return unsupportedContainerAccessor(path, prefixLength);
    }
    return { status: 'found', value: getDataPropertyValue(descriptor) };
}
