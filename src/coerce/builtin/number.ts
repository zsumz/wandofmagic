import { registerBuiltinCoercer } from '../../instructions/coercer/coercer-registry.js';
import { type Coercer, defineCoercer } from '../types.js';

export interface NumberCoercerOptions {
    readonly integer?: boolean;
}

const decimalNumber = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

/** Convert finite numbers and explicit decimal strings to a number. */
export function number(options: NumberCoercerOptions = {}): Coercer<number | string, number> {
    const integer = options.integer === true;
    const coercer = defineCoercer<number | string, number>({
        name: integer ? 'integer' : 'number',
        run(value) {
            if (typeof value !== 'number' && typeof value !== 'string') {
                return { message: 'Expected a number or decimal string.', ok: false };
            }

            if (typeof value === 'string' && !decimalNumber.test(value.trim())) {
                return { message: 'Expected an explicit decimal number.', ok: false };
            }

            const converted = typeof value === 'number' ? value : Number(value);
            if (!Number.isFinite(converted)) {
                return { message: 'Expected a finite number.', ok: false };
            }

            if (integer && !Number.isInteger(converted)) {
                return { message: 'Expected an integer.', ok: false };
            }

            return { ok: true, value: converted };
        },
    });
    return registerBuiltinCoercer(coercer, { integer, kind: 'number' });
}
