import { WandError } from '../../../../../dist/index.js';
import { deriveDisplayName } from '../../scenario/display-name.mts';
import { throwIssue } from './issues.mts';
import { hasOwn } from './record-fields.mts';

export function deriveName(value: Record<string, unknown>): void {
    if (hasOwn(value, 'displayName')) {
        throwIssue({
            code: 'destination_conflict',
            id: 'derive:6',
            kind: 'derive',
            message: 'Cannot derive displayName; the destination already exists.',
            path: 'displayName',
        });
    }
    const dependencies = ['firstName', 'lastName'];
    const inputs: unknown[] = new Array(dependencies.length);
    for (let index = 0; index < dependencies.length; index += 1) {
        const key = dependencies[index];
        if (key === undefined) {
            continue;
        }
        const current = hasOwn(value, key) ? value[key] : undefined;
        if (current === undefined) {
            throwIssue({
                code: 'missing_field',
                id: 'derive:6',
                kind: 'derive',
                message: `Cannot derive displayName; ${key} is missing or undefined.`,
                path: key,
            });
        }
        inputs[index] = current;
    }

    try {
        const result = deriveDisplayName(inputs);
        if (isPromiseLike(result)) {
            throwIssue({
                code: 'transform_failed',
                id: 'derive:6',
                kind: 'derive',
                message: 'The derive callback for displayName returned a promise in the synchronous core.',
                path: 'displayName',
            });
        }
        value['displayName'] = result;
    } catch (cause) {
        if (cause instanceof WandError) {
            throw cause;
        }
        throwIssue({
            cause,
            code: 'transform_failed',
            id: 'derive:6',
            kind: 'derive',
            message: 'The derive callback for displayName threw an error.',
            path: 'displayName',
        });
    }
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
    return value !== null
        && (typeof value === 'object' || typeof value === 'function')
        && typeof Reflect.get(value, 'then') === 'function';
}
