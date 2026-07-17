import type { DataRecord } from '../core/data-record.js';
import { createIssue, type WandIssue } from '../core/issue.js';
import type { FieldPath, PathSegment } from '../core/path.js';
import {
    castInputRecord,
    getDataPropertyValue,
    getObjectPrototype,
    isUnknownArray,
} from '../internal/type-boundary.js';
import { pathPrefix } from './path-prefix.js';

export type PathContainer = DataRecord | unknown[];

export type ContainerInspection =
    | { readonly issue: WandIssue; readonly ok: false }
    | { readonly ok: true; readonly value: PathContainer };

export type ContainerRead =
    | { readonly issue: WandIssue; readonly status: 'failed' }
    | { readonly status: 'found'; readonly value: unknown }
    | { readonly status: 'missing' };

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
        return failedInspection(path, prefixLength, cause);
    }
}

/** Read one own enumerable data property from a previously inspected container. */
export function readContainerField(
    container: PathContainer,
    segment: PathSegment,
    path: FieldPath,
    prefixLength: number,
): ContainerRead {
    if (isUnknownArray(container) ? typeof segment !== 'number' : typeof segment !== 'string') {
        return {
            issue: createIssue({
                code: 'unexpected_type',
                message: isUnknownArray(container)
                    ? 'Array paths require numeric indices.'
                    : 'Object paths require string fields.',
                path: pathPrefix(path, prefixLength),
            }),
            status: 'failed',
        };
    }

    let descriptor: PropertyDescriptor | undefined;
    try {
        descriptor = Object.getOwnPropertyDescriptor(container, segment);
    } catch (cause) {
        return {
            issue: failedInspection(path, prefixLength, cause).issue,
            status: 'failed',
        };
    }
    if (descriptor?.enumerable !== true) {
        return { status: 'missing' };
    }
    if (!('value' in descriptor)) {
        return {
            issue: createIssue({
                code: 'unsupported_accessor',
                message: 'Wandofmagic will not execute an accessor along the selected path.',
                path: pathPrefix(path, prefixLength),
            }),
            status: 'failed',
        };
    }
    return { status: 'found', value: getDataPropertyValue(descriptor) };
}

function unexpectedContainer(path: FieldPath, prefixLength: number): ContainerInspection {
    return {
        issue: createIssue({
            code: 'unexpected_type',
            message: 'Wandofmagic can only traverse plain objects, null-prototype objects, and arrays.',
            path: pathPrefix(path, prefixLength),
        }),
        ok: false,
    };
}

function failedInspection(
    path: FieldPath,
    prefixLength: number,
    cause: unknown,
): { readonly issue: WandIssue; readonly ok: false } {
    return {
        issue: createIssue({
            cause,
            code: 'invalid_input',
            message: 'Wandofmagic could not inspect a container along the selected path.',
            path: pathPrefix(path, prefixLength),
        }),
        ok: false,
    };
}
