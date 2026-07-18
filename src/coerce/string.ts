import { type Coercer, defineCoercer } from './types.js';
import { registerBuiltinCoercer } from '../instructions/coercer-instruction.js';

export type StringCoercerInput = bigint | boolean | number | string;

/** Convert primitive scalar values to a string without accepting objects or symbols. */
export function string(): Coercer<StringCoercerInput, string> {
    const coercer = defineCoercer<StringCoercerInput, string>({
        name: 'string',
        run(value) {
            if (
                typeof value !== 'bigint' &&
                typeof value !== 'boolean' &&
                typeof value !== 'number' &&
                typeof value !== 'string'
            ) {
                return { message: 'Expected a string-compatible primitive.', ok: false };
            }

            return { ok: true, value: String(value) };
        },
    });
    return registerBuiltinCoercer(coercer, { kind: 'string' });
}
