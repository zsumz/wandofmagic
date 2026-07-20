import { type InferOutput, type Spell, spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';
import { emitTrustedMapperModule, type TrustedMapperModule } from 'wandofmagic/compiler';

interface WireUser {
    age?: string;
    first_name: string;
    secret: string;
}

const normalize = spell<WireUser>()
    .rename({ first_name: 'firstName' })
    .coerce('age', number(), { missing: 'skip' })
    .default('active', false as const)
    .derive('label', ['firstName'], ([firstName]) => firstName.toUpperCase())
    .omit(['secret'])
    .build();

interface User {
    active: false;
    age?: number;
    firstName: string;
    label: string;
}

const spellContract: Spell<WireUser, User> = normalize;
void spellContract;

const generatedArtifact: TrustedMapperModule = emitTrustedMapperModule(normalize);
void generatedArtifact;

const missingOptionalInput: User = normalize.run({
    first_name: 'Ada',
    secret: 'hidden',
});
void missingOptionalInput;

const presentOptionalInput: User = normalize.run({
    age: '42',
    first_name: 'Ada',
    secret: 'hidden',
});
void presentOptionalInput;

declare const inferredOutput: InferOutput<typeof normalize>;
const inferredIsAssignableToExpected: User = inferredOutput;
void inferredIsAssignableToExpected;

declare const expectedOutput: User;
const expectedIsAssignableToInferred: InferOutput<typeof normalize> = expectedOutput;
void expectedIsAssignableToInferred;

// @ts-expect-error -- numeric fields cannot be trimmed.
spell<{ age?: number }>().trim(['age']);

// @ts-expect-error -- rename mappings cannot contain unknown source fields.
spell<WireUser>().rename({ missing: 'value' });

// @ts-expect-error -- derive cannot overwrite an existing field.
spell<WireUser>().derive('first_name', ['age'], ([age]) => age);

// @ts-expect-error -- derive requires at least one declared dependency.
spell<WireUser>().derive('empty', [], () => 'value');

// @ts-expect-error -- an existing numeric field cannot receive a string default.
spell<{ count?: number }>().default('count', 'zero');

const widenedRename = { first_name: 'firstName' };

// @ts-expect-error -- rename destinations must remain literal keys.
spell<WireUser>().rename(widenedRename);
