import { number } from '../../../src/coerce/builtin/number.js';
import { spell } from '../../../src/builder/spell/spell.js';

interface ProjectionInput {
    readonly age?: string;
    readonly email: string;
    readonly first_name: string;
    readonly last_name: string;
    readonly password_hash: string;
}

const sensitiveFallback = Object.freeze({ token: 'not-serialized' });

export const projectionConformanceSpell = spell<ProjectionInput>()
    .rename({
        first_name: 'firstName',
        last_name: 'lastName',
        password_hash: 'passwordHash',
    })
    .trim(['firstName', 'lastName', 'email'])
    .coerce('age', number({ integer: true }))
    .default('metadata', sensitiveFallback)
    .derive('displayName', ['firstName', 'lastName'], ([firstName, lastName]) =>
        `${firstName} ${lastName}`)
    .omit(['passwordHash'])
    .build();

const valid: ProjectionInput = {
    age: '37',
    email: '  ada@example.com ',
    first_name: ' Ada ',
    last_name: ' Lovelace ',
    password_hash: 'private',
};
const missingAge = { ...valid };
Reflect.deleteProperty(missingAge, 'age');

export const projectionConformanceInputs: readonly ProjectionInput[] = [
    valid,
    unsafeProjectionInput({ ...valid, firstName: 'existing' }),
    unsafeProjectionInput({ ...valid, email: 7 }),
    { ...valid, age: 'invalid' },
    missingAge,
    unsafeProjectionInput({ ...valid, displayName: 'existing' }),
];

export const nullPrototypeProjectionInput = Object.assign(Object.create(null) as object, valid);
Object.defineProperty(nullPrototypeProjectionInput, '__proto__', {
    enumerable: true,
    value: { safe: true },
});

function unsafeProjectionInput(value: object): ProjectionInput {
    // Deliberately cross the public type boundary to exercise JavaScript/runtime misuse.
    return value as ProjectionInput;
}
