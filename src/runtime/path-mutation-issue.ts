import { createIssue, type WandIssue } from '../core/issue.js';
import type { FieldPath } from '../core/path.js';
import { pathPrefix } from './path-prefix.js';

export function pathCycleIssue(
    path: FieldPath,
    length: number,
    operation: 'delete' | 'write',
): WandIssue {
    return createIssue({
        code: 'invalid_input',
        message: operation === 'write'
            ? 'A deep write cannot create or traverse a cycle.'
            : 'A deep delete cannot traverse a cycle.',
        path: pathPrefix(path, length),
    });
}

export function invalidNormalizedPathIssue(path: FieldPath): WandIssue {
    return createIssue({
        code: 'invalid_input',
        message: 'Wandofmagic received an invalid normalized path.',
        path,
    });
}

export function rootArrayMutationIssue(path: FieldPath): WandIssue {
    return createIssue({
        code: 'invalid_input',
        message: 'Ordinary spells do not accept arrays at the root.',
        path: pathPrefix(path, 1),
    });
}
