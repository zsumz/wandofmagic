import { createIssue } from '../../core/issue/create-issue.js';
import type { WandIssue } from '../../core/issue/issue-types.js';
import type { FieldPath } from '../../core/path/path.js';
import { pathPrefix } from '../path/path-prefix.js';
import type { ContainerInspection, ContainerRead } from './container-types.js';

export function unexpectedContainer(
    path: FieldPath,
    prefixLength: number,
): ContainerInspection {
    return {
        issue: createIssue({
            code: 'unexpected_type',
            message: 'Wandofmagic can only traverse plain objects, null-prototype objects, and arrays.',
            path: pathPrefix(path, prefixLength),
        }),
        ok: false,
    };
}

export function failedContainerInspection(
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

export function unexpectedPathSegment(
    path: FieldPath,
    prefixLength: number,
    arrayContainer: boolean,
): ContainerRead {
    return {
        issue: createIssue({
            code: 'unexpected_type',
            message: arrayContainer
                ? 'Array paths require numeric indices.'
                : 'Object paths require string fields.',
            path: pathPrefix(path, prefixLength),
        }),
        status: 'failed',
    };
}

export function unsupportedContainerAccessor(
    path: FieldPath,
    prefixLength: number,
): ContainerRead {
    return {
        issue: createIssue({
            code: 'unsupported_accessor',
            message: 'Wandofmagic will not execute an accessor along the selected path.',
            path: pathPrefix(path, prefixLength),
        }),
        status: 'failed',
    };
}
