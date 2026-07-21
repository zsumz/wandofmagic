import { throwInvalidInput, throwIssue } from './issues.mts';
import { defineField, isPlainRecordPrototype } from './record-fields.mts';
import {
    applyRename,
    assertNoRenameConflict,
    isRenameDestination,
    isRenameSource,
} from './rename-fields.mts';

export function projectTrustedInput(input: object): Record<string, unknown> {
    let prototype: object | null;
    try {
        const inspectedPrototype: unknown = Object.getPrototypeOf(input);
        if (inspectedPrototype !== null && typeof inspectedPrototype !== 'object') {
            throw new TypeError('Object.getPrototypeOf() returned an invalid prototype.');
        }
        prototype = inspectedPrototype;
    } catch (cause) {
        throwInvalidInput(cause);
    }
    if (!isPlainRecordPrototype(prototype)) {
        throwIssue({
            code: 'invalid_input',
            message: Array.isArray(input)
                ? 'The v0 execution core accepts a plain object at the root, not an array.'
                : 'Wandofmagic accepts plain objects and null-prototype objects at the root.',
        });
    }

    const snapshot = prototype === null ? createNullPrototypeRecord() : {};
    const sources: Record<string, unknown> = {};
    const present: Record<string, boolean> = {};
    try {
        for (const key in input) {
            const value: unknown = Reflect.get(input, key);
            if (isRenameSource(key)) {
                present[key] = true;
                sources[key] = value;
            } else if (isRenameDestination(key)) {
                present[key] = true;
                if (key !== 'passwordHash') {
                    snapshot[key] = value;
                }
            } else {
                defineField(snapshot, key, value);
            }
        }
    } catch (cause) {
        throwInvalidInput(cause);
    }

    applyRename(snapshot, sources, present, 'first_name', 'firstName');
    applyRename(snapshot, sources, present, 'last_name', 'lastName');
    assertNoRenameConflict(present, 'password_hash', 'passwordHash');
    return snapshot;
}

function createNullPrototypeRecord(): Record<string, unknown> {
    const record: Record<string, unknown> = {};
    Object.setPrototypeOf(record, null);
    return record;
}
