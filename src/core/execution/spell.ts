import type { SpellDescription } from '../plan/description-types.js';
import type { RunOptions } from './run-options.js';
import type { WandResult } from './result.js';

/** A compiled, immutable, reusable data transformation. */
export interface Spell<Input extends object, Output extends object> {
    /** Return static, value-free plan metadata. */
    describe(): SpellDescription;

    /** Execute and throw `WandError` on failure. */
    run(input: Input, options?: RunOptions): Output;

    /** Execute without throwing, collecting privacy-safe changes unless explicitly discarded. */
    safeRun(input: Input, options?: RunOptions): WandResult<Output>;
}

type SpellParts<Value> = Value extends Spell<infer Input, infer Output>
    ? readonly [input: Input, output: Output]
    : readonly [input: never, output: never];

/** Extract a spell's input type. */
export type InferInput<Value> = SpellParts<Value>[0];

/** Extract a spell's output type. */
export type InferOutput<Value> = SpellParts<Value>[1];
