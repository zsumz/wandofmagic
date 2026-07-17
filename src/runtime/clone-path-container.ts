import { createIssue, type WandIssue } from '../core/issue.js';
import type { FieldPath, PathSegment } from '../core/path.js';
import {
    createDataRecord,
    createSparseDataArray,
    getDataPropertyValue,
    getObjectPrototype,
    isUnknownArray,
} from '../internal/type-boundary.js';
import type { PathContainer } from './path-container.js';
import { pathPrefix } from './path-prefix.js';

export type ContainerCloneResult =
    | { readonly issue: WandIssue; readonly ok: false }
    | { readonly ok: true; readonly value: PathContainer };

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
        return failedClone(path, prefixLength, cause);
    }
    for (const symbol of symbols) {
        try {
            if (Object.getOwnPropertyDescriptor(container, symbol)?.enumerable === true) {
                return invalidClone(
                    path,
                    prefixLength,
                    'Enumerable symbol keys are outside Wandofmagic\'s JSON-like data model.',
                );
            }
        } catch (cause) {
            return failedClone(path, prefixLength, cause);
        }
    }

    let clone: PathContainer;
    try {
        clone = createClone(container);
    } catch (cause) {
        return failedClone(path, prefixLength, cause);
    }
    for (const key of keys) {
        const segment = isUnknownArray(container) ? arrayIndex(key) : key;
        if (segment === undefined) {
            return invalidClone(
                path,
                prefixLength,
                'Arrays may only contain enumerable index properties.',
            );
        }
        let descriptor: PropertyDescriptor | undefined;
        try {
            descriptor = Object.getOwnPropertyDescriptor(container, key);
        } catch (cause) {
            return failedClone(path, prefixLength, cause);
        }
        if (descriptor?.enumerable !== true) {
            continue;
        }
        if (!('value' in descriptor)) {
            return {
                issue: createIssue({
                    code: 'unsupported_accessor',
                    message: 'Wandofmagic will not copy an accessor in a touched container.',
                    path: appendPath(path, prefixLength, segment),
                }),
                ok: false,
            };
        }
        defineContainerField(clone, segment, getDataPropertyValue(descriptor));
    }
    return { ok: true, value: clone };
}

/** Define a writable enumerable data field on a private object or array clone. */
export function defineContainerField(
    container: PathContainer,
    segment: PathSegment,
    value: unknown,
): void {
    Object.defineProperty(container, segment, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
    });
}

function createClone(container: PathContainer): PathContainer {
    if (isUnknownArray(container)) {
        return createSparseDataArray(container.length);
    }
    return createDataRecord(getObjectPrototype(container));
}

function arrayIndex(key: string): number | undefined {
    const value = Number(key);
    return Number.isSafeInteger(value)
        && value >= 0
        && value < 4_294_967_295
        && String(value) === key
        ? value
        : undefined;
}

function appendPath(path: FieldPath, prefixLength: number, segment: PathSegment): FieldPath {
    return Object.freeze([path[0], ...path.slice(1, prefixLength), segment]);
}

function invalidClone(
    path: FieldPath,
    prefixLength: number,
    message: string,
): ContainerCloneResult {
    return {
        issue: createIssue({
            code: 'invalid_input',
            message,
            path: pathPrefix(path, prefixLength),
        }),
        ok: false,
    };
}

function failedClone(
    path: FieldPath,
    prefixLength: number,
    cause: unknown,
): ContainerCloneResult {
    return {
        issue: createIssue({
            cause,
            code: 'invalid_input',
            message: 'Wandofmagic could not clone a container along the selected path.',
            path: pathPrefix(path, prefixLength),
        }),
        ok: false,
    };
}
