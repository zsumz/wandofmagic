import { collection, spell, wand } from 'wandofmagic';
import { defineCoercer, number } from 'wandofmagic/coerce';

interface ReadmeWireUser {
    age?: string;
    first_name: string;
    password_hash: string;
}

const readmeNormalizeUser = spell<ReadmeWireUser>()
    .rename({
        first_name: 'firstName',
        password_hash: 'passwordHash',
    })
    .trim(['firstName'])
    .coerce('age', number({ integer: true }), { missing: 'skip' })
    .omit(['passwordHash'])
    .build();

const readmeResult = readmeNormalizeUser.safeRun({
    age: '37',
    first_name: '  Ada  ',
    password_hash: 'private',
});
if (readmeResult.ok) {
    const readmeOutput: { age?: number; firstName: string } = readmeResult.value;
    void readmeOutput;
}

interface WireProduct {
    name: string;
    price: string;
}

const normalizeProduct = spell<WireProduct>()
    .trim(['name'])
    .coerce('price', number())
    .build();

const product: { name: string; price: number } = normalizeProduct.run({
    name: '  Field Notes  ',
    price: '12.50',
});
void product;

const safeProduct = normalizeProduct.safeRun({
    name: 'Notebook',
    price: 'not a number',
});
if (!safeProduct.ok) {
    const code: string | undefined = safeProduct.issues[0]?.code;
    void code;
}

const profile: { name: string } = wand({ name: '  Ada  ', private: true })
    .trim(['name'])
    .omit(['private'])
    .value();
void profile;

interface WireOrder {
    customer: { name: string };
    rows: Array<{ quantity: string }>;
}

const normalizeOrder = spell<WireOrder>()
    .trim([['customer', 'name']])
    .coerce(['rows', 0, 'quantity'], number({ integer: true }))
    .build();
void normalizeOrder;

interface WireUser {
    age?: string;
    name: string;
}

const normalizeUser = spell<WireUser>()
    .trim(['name'])
    .coerce('age', number(), { missing: 'skip' })
    .default('active', true)
    .build();
void normalizeUser;

interface WireContact {
    email: string;
    legacyId: string;
}

const normalizeContact = spell<WireContact>()
    .copy('email', ['contact', 'email'])
    .move('legacyId', ['metadata', 'legacyId'])
    .build();
void normalizeContact;

interface Person {
    firstName: string;
    lastName: string;
}

const normalizePerson = spell<Person>()
    .transform('firstName', (name) => name.trim())
    .transform('lastName', (name) => name.trim())
    .derive(
        'displayName',
        ['firstName', 'lastName'],
        ([firstName, lastName]) => `${firstName} ${lastName}`,
    )
    .build();
void normalizePerson;

interface WireRow {
    quantity: string;
}

const normalizeRow = spell<WireRow>()
    .coerce('quantity', number({ integer: true }))
    .build();
const normalizeRows = collection(normalizeRow);
const rows: Array<{ quantity: number }> = normalizeRows.run([
    { quantity: '2' },
    { quantity: '5' },
]);
void rows;

const yesNo = defineCoercer<'yes' | 'no', boolean>({
    name: 'yes-no',
    run(value) {
        if (value === 'yes') return { ok: true, value: true };
        if (value === 'no') return { ok: true, value: false };
        return { ok: false, message: 'Expected "yes" or "no".' };
    },
});
void yesNo;

const ownedProduct = { name: 'Pencil', price: '2' };
normalizeProduct.run(ownedProduct);
normalizeProduct.run(ownedProduct, {
    input: 'trusted',
    receipt: 'discard',
});
