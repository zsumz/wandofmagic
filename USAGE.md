# Usage

Wandofmagic turns one object shape into another without changing the input object. This guide starts
with the common path. The [API reference](./API.md) lists every operation and option.

## Install

```sh
npm install wandofmagic@alpha
```

Wandofmagic supports ESM and CommonJS. TypeScript users get the same types from either module system.

```ts
import { spell, wand } from 'wandofmagic';
import { boolean, isoDate, number, string } from 'wandofmagic/coerce';
```

## Build a reusable spell

Start with the shape you receive. Chain operations in the order they should run, then call
`build()`.

```ts
import { spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';

type WireProduct = {
  name: string;
  price: string;
};

const normalizeProduct = spell<WireProduct>()
  .trim(['name'])
  .coerce('price', number())
  .build();

const product = normalizeProduct.run({
  name: '  Field Notes  ',
  price: '12.50',
});

// product is { name: string; price: number }
// the input object was not changed
```

Use `run()` when failure should throw. Use `safeRun()` when failure is part of normal control flow:

```ts
const result = normalizeProduct.safeRun({
  name: 'Notebook',
  price: 'not a number',
});

if (!result.ok) {
  console.error(result.issues[0]?.code); // 'coercion_failed'
}
```

## Make a one-off change

`wand(value)` binds the builder to one value. Finish with `value()` or `result()`.

```ts
import { wand } from 'wandofmagic';

const profile = wand({ name: '  Ada  ', private: true })
  .trim(['name'])
  .omit(['private'])
  .value();

// { name: 'Ada' }
```

`value()` throws on failure. `result()` returns the same safe result shape as `safeRun()`.

## Use deep paths

A string names a top-level field. A tuple names a deep path. Array indices are numbers.

```ts
type WireOrder = {
  customer: {
    name: string;
  };
  rows: Array<{
    quantity: string;
  }>;
};

const normalizeOrder = spell<WireOrder>()
  .trim([['customer', 'name']])
  .coerce(['rows', 0, 'quantity'], number({ integer: true }))
  .build();
```

Paths are checked against the current output type and may contain at most eight segments. Dangerous
segments such as `__proto__` are rejected while the plan is built.

## Handle missing fields

Operations that read a value fail when it is missing or `undefined` unless you choose
`{ missing: 'skip' }`.

```ts
type WireUser = {
  age?: string;
  name: string;
};

const normalizeUser = spell<WireUser>()
  .trim(['name'])
  .coerce('age', number(), { missing: 'skip' })
  .default('active', true)
  .build();
```

`default()` is different: it writes the fallback only when the field is missing or `undefined`.

## Copy and move values

`copy()` keeps the source. `move()` removes it. Both fail by default if the source is missing or the
destination already exists.

```ts
type WireContact = {
  email: string;
  legacyId: string;
};

const normalizeContact = spell<WireContact>()
  .copy('email', ['contact', 'email'])
  .move('legacyId', ['metadata', 'legacyId'])
  .build();
```

Use `conflict: 'overwrite'` to replace an existing destination or `conflict: 'preserve'` to keep
it. Use `missing: 'skip'` when an absent source should be ignored.

## Derive and transform values

`transform()` replaces one value. `derive()` reads one or more values and writes a new field.
Callbacks are synchronous.

```ts
type Person = {
  firstName: string;
  lastName: string;
};

const normalizePerson = spell<Person>()
  .transform('firstName', (name) => name.trim())
  .transform('lastName', (name) => name.trim())
  .derive(
    'displayName',
    ['firstName', 'lastName'],
    ([firstName, lastName]) => `${firstName} ${lastName}`,
  )
  .build();
```

Callbacks receive readonly values. Throwing from a callback produces a structured issue instead of
a partial output.

## Transform collections

Wrap a reusable item spell with `collection()` to apply it to each present array item.

```ts
import { collection, spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';

type WireRow = {
  quantity: string;
};

const normalizeRow = spell<WireRow>()
  .coerce('quantity', number({ integer: true }))
  .build();

const normalizeRows = collection(normalizeRow);
const rows = normalizeRows.run([
  { quantity: '2' },
  { quantity: '5' },
]);

// rows is Array<{ quantity: number }>
```

Collection issues and changes include the item index in their path. Sparse arrays remain sparse.

## Define a coercer

The built-ins are `number()`, `boolean()`, `string()`, and `isoDate()`. A coercer validates and
converts one value without throwing.

```ts
import { defineCoercer } from 'wandofmagic/coerce';

const yesNo = defineCoercer<'yes' | 'no', boolean>({
  name: 'yes-no',
  run(value) {
    if (value === 'yes') return { ok: true, value: true };
    if (value === 'no') return { ok: true, value: false };
    return { ok: false, message: 'Expected "yes" or "no".' };
  },
});
```

Coercer names appear in descriptions and change records, so keep them stable.

## Inspect changes

Successful safe execution includes value-free change records:

```ts
const result = normalizeProduct.safeRun({
  name: '  Pencil  ',
  price: '2',
});

if (result.ok) {
  console.log(result.changes);
  // [
  //   { kind: 'trim', path: ['name'], stepId: 'trim:1' },
  //   { kind: 'coerce', coercer: 'number', ... }
  // ]
}
```

Pass `{ receipt: 'discard' }` when you do not need them.

## Use trusted execution

Checked execution inspects data properties without invoking getters. It is the default and should
be used at application boundaries.

```ts
const ownedProduct = {
  name: 'Pencil',
  price: '2',
};

normalizeProduct.run(ownedProduct);
```

Trusted execution skips some input checks:

```ts
normalizeProduct.run(ownedProduct, {
  input: 'trusted',
  receipt: 'discard',
});
```

Only use it for plain records your code controls: own enumerable string data properties, no
accessors, proxies, enumerable symbols, or inherited enumerable properties. See the
[security policy](./SECURITY.md) for the full contract.

For build-time specialization of that same contract, see the compiler section in the
[API reference](./API.md#compiler).
