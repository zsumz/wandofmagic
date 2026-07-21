import { WandError } from '../dist/index.js';

const decimalNumber = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const emptyChanges = Object.freeze([]);
const objectPrototype = Object.prototype;

export function deriveDisplayName([firstName, lastName]) {
    return `${firstName} ${lastName}`;
}

export function runHandwrittenSpreadHistorical(input) {
    const firstName = input.first_name.trim();
    const lastName = input.last_name.trim();
    const output = {
        ...input,
        active: false,
        age: Number(input.age),
        displayName: `${firstName} ${lastName}`,
        email: input.email.trim(),
        firstName,
        lastName,
    };
    Reflect.deleteProperty(output, 'first_name');
    Reflect.deleteProperty(output, 'last_name');
    Reflect.deleteProperty(output, 'password_hash');
    return output;
}

export function runHandwrittenObjectKeysHappy(input) {
    return runHappyMapper(input, Object.keys(input));
}

export function runHandwrittenForInHappy(input) {
    const output = {};
    let firstName = '';
    let lastName = '';

    for (const key in input) {
        const value = input[key];
        switch (key) {
            case 'age':
                output.age = Number(value);
                break;
            case 'email':
                output.email = value.trim();
                break;
            case 'first_name':
                firstName = value.trim();
                output.firstName = firstName;
                break;
            case 'last_name':
                lastName = value.trim();
                output.lastName = lastName;
                break;
            case 'password_hash':
                break;
            default:
                output[key] = value;
        }
    }

    output.active = false;
    output.displayName = `${firstName} ${lastName}`;
    return output;
}

export function runHandwrittenEquivalent(input) {
    const snapshot = projectTrustedInput(input);
    trimFields(snapshot);
    coerceAge(snapshot);
    coerceActive(snapshot);
    if (!hasOwn(snapshot, 'active') || snapshot.active === undefined) {
        snapshot.active = false;
    }
    deriveName(snapshot);
    return snapshot;
}

function runHappyMapper(input, keys) {
    const output = {};
    let firstName = '';
    let lastName = '';

    for (const key of keys) {
        const value = input[key];
        switch (key) {
            case 'age':
                output.age = Number(value);
                break;
            case 'email':
                output.email = value.trim();
                break;
            case 'first_name':
                firstName = value.trim();
                output.firstName = firstName;
                break;
            case 'last_name':
                lastName = value.trim();
                output.lastName = lastName;
                break;
            case 'password_hash':
                break;
            default:
                output[key] = value;
        }
    }

    output.active = false;
    output.displayName = `${firstName} ${lastName}`;
    return output;
}

function projectTrustedInput(input) {
    let prototype;
    try {
        prototype = Object.getPrototypeOf(input);
    } catch (cause) {
        throwInvalidInput(cause);
    }
    if (prototype !== objectPrototype && prototype !== null) {
        throwIssue({
            code: 'invalid_input',
            message: Array.isArray(input)
                ? 'The v0 execution core accepts a plain object at the root, not an array.'
                : 'Wandofmagic accepts plain objects and null-prototype objects at the root.',
        });
    }

    const snapshot = prototype === null ? Object.create(null) : {};
    const sources = {};
    const present = {};
    try {
        for (const key in input) {
            const value = input[key];
            switch (key) {
                case 'first_name':
                case 'last_name':
                case 'password_hash':
                    present[key] = true;
                    sources[key] = value;
                    break;
                case 'firstName':
                case 'lastName':
                case 'passwordHash':
                    present[key] = true;
                    if (key !== 'passwordHash') {
                        snapshot[key] = value;
                    }
                    break;
                default:
                    defineField(snapshot, key, value);
            }
        }
    } catch (cause) {
        throwInvalidInput(cause);
    }

    assertNoRenameConflict(present, 'first_name', 'firstName');
    assertNoRenameConflict(present, 'last_name', 'lastName');
    assertNoRenameConflict(present, 'password_hash', 'passwordHash');
    if (present.first_name === true) {
        snapshot.firstName = sources.first_name;
    }
    if (present.last_name === true) {
        snapshot.lastName = sources.last_name;
    }
    return snapshot;
}

function assertNoRenameConflict(present, source, destination) {
    if (present[source] === true && present[destination] === true) {
        throwIssue({
            code: 'destination_conflict',
            id: 'rename:1',
            kind: 'rename',
            message: `Cannot rename ${source} to ${destination}; the destination already exists.`,
            path: destination,
        });
    }
}

function trimFields(value) {
    const fields = ['firstName', 'lastName', 'email'];
    const currentValues = new Array(fields.length);
    for (let index = 0; index < fields.length; index += 1) {
        const key = fields[index];
        const current = hasOwn(value, key) ? value[key] : undefined;
        currentValues[index] = current;
        if (current !== null && current !== undefined && typeof current !== 'string') {
            throwIssue({
                code: 'unexpected_type',
                id: 'trim:2',
                kind: 'trim',
                message: `Cannot trim ${key}; expected a string, null, or undefined.`,
                path: key,
            });
        }
    }
    for (let index = 0; index < fields.length; index += 1) {
        const current = currentValues[index];
        if (typeof current === 'string') {
            value[fields[index]] = current.trim();
        }
    }
}

function coerceAge(value) {
    const current = hasOwn(value, 'age') ? value.age : undefined;
    if (current === undefined) {
        throwIssue({
            code: 'missing_field',
            id: 'coerce:3',
            kind: 'coerce',
            message: 'Cannot coerce age; the field is missing or undefined.',
            path: 'age',
        });
    }
    if (typeof current !== 'number' && typeof current !== 'string') {
        throwCoercionFailure(
            'age',
            'integer',
            'coerce:3',
            'Expected a number or decimal string.',
        );
    }
    if (typeof current === 'string' && !decimalNumber.test(current.trim())) {
        throwCoercionFailure(
            'age',
            'integer',
            'coerce:3',
            'Expected an explicit decimal number.',
        );
    }
    const converted = typeof current === 'number' ? current : Number(current);
    if (!Number.isFinite(converted)) {
        throwCoercionFailure('age', 'integer', 'coerce:3', 'Expected a finite number.');
    }
    if (!Number.isInteger(converted)) {
        throwCoercionFailure('age', 'integer', 'coerce:3', 'Expected an integer.');
    }
    value.age = converted;
}

function coerceActive(value) {
    const current = hasOwn(value, 'active') ? value.active : undefined;
    if (current === undefined || typeof current === 'boolean') {
        return;
    }
    if (typeof current !== 'string') {
        throwCoercionFailure(
            'active',
            'boolean',
            'coerce:4',
            'Expected a boolean or boolean string.',
        );
    }
    const candidate = current.toLowerCase();
    if (candidate === 'true' || candidate === 'false') {
        value.active = candidate === 'true';
        return;
    }
    throwCoercionFailure(
        'active',
        'boolean',
        'coerce:4',
        'Expected the string "true" or "false".',
    );
}

function deriveName(value) {
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
    const inputs = new Array(dependencies.length);
    for (let index = 0; index < dependencies.length; index += 1) {
        const key = dependencies[index];
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
        value.displayName = result;
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

function throwCoercionFailure(path, coercer, id, message) {
    throwIssue({ code: 'coercion_failed', details: { coercer }, id, kind: 'coerce', message, path });
}

function throwInvalidInput(cause) {
    throwIssue({
        cause,
        code: 'invalid_input',
        message: 'Wandofmagic could not inspect the input record.',
    });
}

function throwIssue({ cause, code, details, id, kind, message, path }) {
    const issue = {
        code,
        message,
        ...details === undefined ? {} : { details: Object.freeze(details) },
        ...path === undefined ? {} : { path: Object.freeze([path]) },
        ...id === undefined ? {} : { step: Object.freeze({ id, kind }) },
    };
    if (cause !== undefined) {
        Object.defineProperty(issue, 'cause', { value: cause });
    }
    throw new WandError(Object.freeze({
        changes: emptyChanges,
        issues: Object.freeze([Object.freeze(issue)]),
        ok: false,
    }));
}

function defineField(record, key, value) {
    if (key === '__proto__') {
        Object.defineProperty(record, key, {
            configurable: true,
            enumerable: true,
            value,
            writable: true,
        });
    } else {
        record[key] = value;
    }
}

function hasOwn(record, key) {
    return objectPrototype.hasOwnProperty.call(record, key);
}

function isPromiseLike(value) {
    return value !== null
        && (typeof value === 'object' || typeof value === 'function')
        && typeof Reflect.get(value, 'then') === 'function';
}
