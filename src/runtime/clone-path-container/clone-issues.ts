import { createIssue } from '../../core/issue/create-issue.js';
import type {
    FieldPath,
    PathSegment,
} from '../../core/path/path.js';
import { pathPrefix } from '../path/path-prefix.js';
import type { ContainerCloneResult } from './clone-result.js';

function clonePathWithSegment(
    path: FieldPath,
    prefixLength: number,
    segment: PathSegment,
): FieldPath {
    return Object.freeze([path[0], ...path.slice(1, prefixLength), segment]);
}

export function cloneAccessorFailure(
    path: FieldPath,
    prefixLength: number,
    segment: PathSegment,
): ContainerCloneResult {
    return {
        issue: createIssue({
            code: 'unsupported_accessor',
            message: 'Wandofmagic will not copy an accessor in a touched container.',
            path: clonePathWithSegment(path, prefixLength, segment),
        }),
        ok: false,
    };
}

export function cloneInvalidInput(
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

export function cloneFailure(
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
