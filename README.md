<p align="center">
  <img src="magicwand-logo.svg" alt="wandofmagic — type-safe data repair" width="1040">
</p>

<p align="center">
  Clean and reshape TypeScript data without mutating the input.
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#example">Example</a> ·
  <a href="#model">Model</a> ·
  <a href="./USAGE.md">Guide</a> ·
  <a href="./API.md">API</a>
</p>

## Install

```sh
npm install wandofmagic@alpha
```

## Example

```ts
import { spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';

type WireUser = {
  age?: string;
  first_name: string;
  password_hash: string;
};

const normalizeUser = spell<WireUser>()
  .rename({
    first_name: 'firstName',
    password_hash: 'passwordHash',
  })
  .trim(['firstName'])
  .coerce('age', number({ integer: true }), { missing: 'skip' })
  .omit(['passwordHash'])
  .build();

const result = normalizeUser.safeRun({
  age: '37',
  first_name: '  Ada  ',
  password_hash: 'private',
});

if (result.ok) {
  console.log(result.value);
  // { age: 37, firstName: 'Ada' }
} else {
  console.error(result.issues);
}
```

The original object is unchanged. TypeScript knows that `age` is now an optional number,
`firstName` exists, and `passwordHash` is gone.

## Model

A spell is an immutable transformation plan. Each operation updates the inferred output type, so
the type follows the data from its wire shape to its application shape.

Use `spell<T>()` when a plan will be reused. Use `wand(value)` for a one-off change:

```ts
import { wand } from 'wandofmagic';

const user = wand({ name: '  Ada  ' })
  .trim(['name'])
  .value();

// { name: 'Ada' }
```

## Operations

- Clean values with `trim`, `coerce`, `default`, and `transform`.
- Reshape records with `rename`, `set`, `copy`, `move`, and `derive`.
- Limit output with `omit` and `pick`.
- Apply one reusable spell to an array with `collection`.

Use a field name for top-level data or a tuple such as `['profile', 'name']` for a deep path.
Paths are type-checked and limited to eight segments.

## Failures

`safeRun()` returns `{ ok: true, value, changes }` or `{ ok: false, issues, changes }`.
`run()` returns the value directly and throws `WandError` on failure. Issues contain stable codes
and paths; change records describe what happened without containing field values.

Checked execution is the default and is designed for untrusted boundary data. Trusted execution
and generated mappers are advanced performance options for inputs your code already controls.

## Learn

- [Usage guide](./USAGE.md) — start here for paths, missing fields, collections, and custom coercers.
- [API reference](./API.md) — operations, options, results, errors, and exported types.
- [Security policy](./SECURITY.md) — reporting and the checked/trusted input contracts.

## License

[MIT](./LICENSE)
