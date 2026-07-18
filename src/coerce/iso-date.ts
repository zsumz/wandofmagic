import { type Coercer, defineCoercer } from './types.js';
import { registerBuiltinCoercer } from '../instructions/coercer-instruction.js';

const isoDateTime =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+-](\d{2}):(\d{2}))$/;

function daysInMonth(year: number, month: number): number {
    if (month === 2) {
        const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        return leapYear ? 29 : 28;
    }

    return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isValidCalendarTimestamp(value: string): boolean {
    const match = isoDateTime.exec(value);
    if (match === null) {
        return false;
    }

    const [
        ,
        yearText,
        monthText,
        dayText,
        hourText,
        minuteText,
        secondText,
        offsetHourText,
        offsetMinuteText,
    ] = match;
    if (
        yearText === undefined ||
        monthText === undefined ||
        dayText === undefined ||
        hourText === undefined ||
        minuteText === undefined ||
        secondText === undefined
    ) {
        return false;
    }

    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const hour = Number(hourText);
    const minute = Number(minuteText);
    const second = Number(secondText);
    const offsetHour = Number(offsetHourText ?? 0);
    const offsetMinute = Number(offsetMinuteText ?? 0);

    return (
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= daysInMonth(year, month) &&
        hour <= 23 &&
        minute <= 59 &&
        second <= 59 &&
        offsetHour <= 23 &&
        offsetMinute <= 59
    );
}

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
