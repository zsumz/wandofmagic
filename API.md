# API

Wandofmagic has three entry points:

- `wandofmagic` — builders, execution, errors, paths, and public types
- `wandofmagic/coerce` — built-in and custom coercers
- `wandofmagic/compiler` — build-time trusted mapper emission

See the [usage guide](./USAGE.md) for complete examples.

## Builders

### `spell<Input>(options?)`

Creates an immutable reusable plan builder.

```ts
const normalize = spell<Input>({ name: 'normalize-user', version: 1 })
  // operations
  .build();
```

`name` and `version` are optional value-free metadata returned by `describe()`.

### `wand(input)`

Creates a one-off builder bound to `input`. It supports the same operations as `spell()`.

- `value(options?)` executes and throws `WandError` on failure.
- `result(options?)` executes and returns a `WandResult`.
- `build()` returns the reusable `Spell` without executing it.

### `collection(itemSpell)`

Returns a reusable spell for a root array. The item spell runs independently for every present
index. Sparse positions are preserved, and item issue/change paths start with the array index.

## Operations

All builders are immutable. Operations run in the order they are chained, and later operations see
the earlier output type.

| Operation | Behavior |
| --- | --- |
| `trim(paths, options?)` | Trim whitespace from selected strings. |
| `coerce(path, coercer, options?)` | Validate and convert one value. |
| `default(path, fallback, options?)` | Write a fallback when a value is missing or `undefined`. |
| `transform(path, callback, options?)` | Replace one value with a synchronous callback result. |
| `rename(mapping, options?)` | Rename one or more top-level fields. |
| `set(path, value, options?)` | Write a constant, creating missing containers when safe. |
| `copy(source, destination, options?)` | Copy a value and keep the source. |
| `move(source, destination, options?)` | Copy a value and remove the source. |
| `derive(destination, dependencies, callback, options?)` | Create a value from ordered dependencies. |
| `omit(paths, options?)` | Remove selected fields or paths. |
| `pick(paths, options?)` | Keep selected paths and their required containers. |

`trim`, `omit`, and `pick` accept a non-empty array of field names, tuple paths, or both. `rename`
uses an object whose keys are current top-level fields and whose values are new field names.

Transform and derive callbacks must be synchronous. A returned promise is rejected as a
`transform_failed` issue.

### Step options

Every operation accepts:

```ts
interface StepOptions {
  id?: string;
}
```

IDs must be unique within a spell. When omitted, Wandofmagic assigns stable IDs such as `trim:1`.
Issue and change records use the step ID.

`coerce()` and `transform()` also accept:

```ts
interface MissingOptions {
  missing?: 'error' | 'skip'; // default: 'error'
}
```

`copy()` and `move()` accept:

```ts
interface CopyOrMoveOptions {
  id?: string;
  missing?: 'error' | 'skip'; // default: 'error'
  conflict?: 'error' | 'overwrite' | 'preserve'; // default: 'error'
}
```

`preserve` leaves an existing destination unchanged. `overwrite` replaces it.

## Paths

A top-level operation can use a field name:

```ts
.trim(['name'])
.coerce('count', number())
```

A deep operation uses a tuple:

```ts
.trim([['profile', 'name']])
.set(['rows', 2, 'selected'], true)
```

The first path segment is a string. Later segments may be strings or array indices. Paths are
limited to `pathDepthLimit`, currently `8`.

Wandofmagic rejects invalid or dangerous paths, duplicate step IDs, and duplicate operation
destinations while the plan is built. These failures throw `PlanError`. Conflicts with values in
an input are execution issues.

## Execution

A built spell has this interface:

```ts
interface Spell<Input extends object, Output extends object> {
  describe(): SpellDescription;
  run(input: Input, options?: RunOptions): Output;
  safeRun(input: Input, options?: RunOptions): WandResult<Output>;
}
```

`run()` throws `WandError` when transformation fails. `safeRun()` returns a discriminated union:

```ts
type WandResult<Output> =
  | { ok: true; value: Output; changes: readonly WandChange[] }
  | { ok: false; issues: readonly WandIssue[]; changes: readonly WandChange[] };
```

Execution is atomic with respect to the input: Wandofmagic builds a new output and never mutates the
input object.

### Run options

```ts
interface RunOptions {
  input?: 'checked' | 'trusted'; // default: 'checked'
  receipt?: 'collect' | 'discard'; // default: 'collect'
}
```

Use `checked` for untrusted boundary data. Use `trusted` only when the caller proves the input
contract described in [Security](./SECURITY.md). `discard` suppresses change collection without
changing transformation or issue behavior.

### Issues

`WandIssue` contains a stable `code`, a message, and optional `path`, `step`, `details`, and `cause`.
Supported codes are:

- `coercion_failed`
- `destination_conflict`
- `invalid_input`
- `missing_field`
- `transform_failed`
- `unexpected_type`
- `unsupported_accessor`

Issues and serialized `WandError` objects do not include raw field values.

### Changes

`WandChange` describes an applied operation with its `kind`, `stepId`, and affected paths. Coercion
changes also include the coercer name and source/destination value types. Raw values are never
included.

### Descriptions

`describe()` returns the spell metadata and one value-free entry per operation:

```ts
interface StepDescription {
  id: string;
  kind: StepKind;
  reads: readonly FieldPath[];
  removes: readonly FieldPath[];
  writes: readonly FieldPath[];
}
```

## Coercers

Import coercers from `wandofmagic/coerce`.

| Coercer | Accepts | Produces |
| --- | --- | --- |
| `number({ integer? })` | finite numbers and explicit decimal strings | `number` |
| `boolean({ caseSensitive? })` | booleans and `"true"` / `"false"` | `boolean` |
| `string()` | strings, numbers, booleans, and bigints | `string` |
| `isoDate()` | valid `Date` objects and ISO/RFC 3339 timestamps with a timezone | `Date` |

`defineCoercer<Input, Output>({ name, run })` creates a named custom coercer. `run` receives an
unknown value and returns `{ ok: true, value }` or `{ ok: false, message, code? }`.

The entry point also exports `Coercer`, `CoercerInput`, `CoercerOutput`, `CoerceResult`, and the
related result and option types.

## Compiler

`emitTrustedMapperModule(spell)` emits deterministic ESM source specialized for the spell. The
artifact contains:

```ts
interface TrustedMapperModule {
  bindingDescriptions: readonly MapperBindingDescription[];
  bindings: readonly unknown[];
  formatVersion: typeof TRUSTED_MAPPER_FORMAT_VERSION;
  mode: 'trusted-discard';
  source: string;
}
```

The generated module exports a `createTrustedMapper(bindings, WandError)` factory. A build
integration writes and audits `source`, checks `formatVersion`, and explicitly supplies the
artifact's opaque `bindings` and Wandofmagic's `WandError` constructor to the factory.

Generated mappers always use trusted input with discarded change records. They are a build-time
optimization, not a replacement for checked execution at an untrusted boundary. Wandofmagic does not
evaluate the emitted source or write files.

## Exports

The main entry point exports:

- builders: `spell`, `SpellBuilder`, `wand`, `WandBuilder`, `collection`
- execution: `Spell`, `InferInput`, `InferOutput`, `WandResult`, `WandSuccess`, `WandFailure`
- configuration: `SpellOptions`, `StepOptions`, `MissingOptions`, `CopyOptions`, `MoveOptions`,
  `RunOptions` and their policy types
- paths: `Path`, `PathInput`, `PathSegment`, `FieldPath`, `DataPath`, `PathOf`, `PathValue`,
  `PathDepth`, `pathDepthLimit`
- path transforms: `AddAtPath`, `ReplaceAtPath`, `RequireAtPath`, `OmitAtPath`, `PickAtPath`,
  `PickAtPaths`
- diagnostics: `WandIssue`, `WandIssueCode`, `WandChange`, `StepKind`, `SpellDescription`,
  `StepDescription`
- errors: `PlanError`, `PlanErrorCode`, `WandError`

The `wandofmagic/coerce` and `wandofmagic/compiler` exports are listed in their sections above.
