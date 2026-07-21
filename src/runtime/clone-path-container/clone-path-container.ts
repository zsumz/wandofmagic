import type { FieldPath } from '../../core/path/path.js';
import { isUnknownArray } from '../../internal/type-boundary/array.js';
import { getDataPropertyValue } from '../../internal/type-boundary/record.js';
import type { PathContainer } from '../path-container/container-types.js';
import { cloneContainerShape, parseArrayIndex } from './clone-container-shape.js';
import {
    cloneAccessorFailure,
    cloneFailure,
    cloneInvalidInput,
} from './clone-issues.js';
import { defineContainerField } from './define-container-field.js';
import type { ContainerCloneResult } from './clone-result.js';

/** Clone one touched container through enumerable data descriptors, preserving sparse arrays. */
export function clonePathContainer(
    container: PathContainer,
    path: FieldPath,
    prefixLength: number,
): ContainerCloneResult {
    let keys: string[];
    let symbols: symbol[];
    try {
        keys = Object.keys(container);
        symbols = Object.getOwnPropertySymbols(container);
    } catch (cause) {
        return cloneFailure(path, prefixLength, cause);
    }

    for (const symbol of symbols) {
        try {
            if (Object.getOwnPropertyDescriptor(container, symbol)?.enumerable === true) {
                return cloneInvalidInput(
                    path,
                    prefixLength,
                    'Enumerable symbol keys are outside Wandofmagic\'s JSON-like data model.',
                );
            }
        } catch (cause) {
            return cloneFailure(path, prefixLength, cause);
        }
    }

    let clone: PathContainer;
    try {
        clone = cloneContainerShape(container);
    } catch (cause) {
        return cloneFailure(path, prefixLength, cause);
    }

    for (const key of keys) {
        const segment = isUnknownArray(container) ? parseArrayIndex(key) : key;
        if (segment === undefined) {
            return cloneInvalidInput(
                path,
                prefixLength,
                'Arrays may only contain enumerable index properties.',
            );
        }
        let descriptor: PropertyDescriptor | undefined;
        try {
            descriptor = Object.getOwnPropertyDescriptor(container, key);
        } catch (cause) {
            return cloneFailure(path, prefixLength, cause);
        }
        if (descriptor?.enumerable !== true) {
            continue;
        }
        if (!('value' in descriptor)) {
            return cloneAccessorFailure(path, prefixLength, segment);
        }
        defineContainerField(clone, segment, getDataPropertyValue(descriptor));
    }
    return { ok: true, value: clone };
}
