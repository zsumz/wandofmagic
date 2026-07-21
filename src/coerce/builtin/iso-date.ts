import { registerBuiltinCoercer } from '../../instructions/coercer/coercer-registry.js';
import { type Coercer, defineCoercer } from '../types.js';
import { isValidCalendarTimestamp } from './valid-calendar-timestamp.js';

/** Convert a Date or explicit ISO/RFC 3339 timestamp to a new Date instance. */
export function isoDate(): Coercer<Date | string, Date> {
    const coercer = defineCoercer<Date | string, Date>({
        name: 'iso-date',
        run(value) {
            if (value instanceof Date) {
                if (Number.isNaN(value.getTime())) {
                    return { message: 'Expected a valid Date.', ok: false };
                }

                return { ok: true, value: new Date(value.getTime()) };
            }

            if (typeof value !== 'string' || !isValidCalendarTimestamp(value)) {
                return { message: 'Expected a valid ISO date-time with an explicit timezone.', ok: false };
            }

            const converted = new Date(value);
            if (Number.isNaN(converted.getTime())) {
                return { message: 'Expected a valid ISO date-time.', ok: false };
            }

            return { ok: true, value: converted };
        },
    });
    return registerBuiltinCoercer(coercer, { kind: 'iso-date' });
}
