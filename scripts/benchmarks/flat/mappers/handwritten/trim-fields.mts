import { throwIssue } from './issues.mts';
import { hasOwn } from './record-fields.mts';

const fields = ['firstName', 'lastName', 'email'] as const;

export function trimFields(value: Record<string, unknown>): void {
    const currentValues: unknown[] = new Array(fields.length);
    for (let index = 0; index < fields.length; index += 1) {
        const key = fields[index];
        if (key === undefined) {
            continue;
        }
        const current = hasOwn(value, key) ? value[key] : undefined;
        currentValues[index] = current;
        if (current !== null && current !== undefined && typeof current !== 'string') {
            throwIssue({
                code: 'unexpected_type',
                id: 'trim:2',
                kind: 'trim',
                message: `Cannot trim ${key}; expected a string, null, or undefined.`,
                path: key,
            });
        }
    }
    for (let index = 0; index < fields.length; index += 1) {
        const key = fields[index];
        const current = currentValues[index];
        if (key !== undefined && typeof current === 'string') {
            value[key] = current.trim();
        }
    }
}
