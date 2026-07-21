import { registerBuiltinCoercer } from '../../instructions/coercer/coercer-registry.js';
import { type Coercer, defineCoercer } from '../types.js';

export interface BooleanCoercerOptions {
    readonly caseSensitive?: boolean;
}

/** Convert booleans and the strings `true` or `false` to a boolean. */
export function boolean(options: BooleanCoercerOptions = {}): Coercer<boolean | string, boolean> {
    const caseSensitive = options.caseSensitive === true;
    const coercer = defineCoercer<boolean | string, boolean>({
        name: 'boolean',
        run(value) {
            if (typeof value === 'boolean') {
                return { ok: true, value };
            }

            if (typeof value !== 'string') {
                return { message: 'Expected a boolean or boolean string.', ok: false };
            }

            const candidate = caseSensitive ? value : value.toLowerCase();
            if (candidate === 'true') {
                return { ok: true, value: true };
            }

            if (candidate === 'false') {
                return { ok: true, value: false };
            }

            return { message: 'Expected the string "true" or "false".', ok: false };
        },
    });
    return registerBuiltinCoercer(coercer, { caseSensitive, kind: 'boolean' });
}
