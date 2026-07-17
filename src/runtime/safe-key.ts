import { PlanError } from '../core/errors.js';

const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);

export function assertSafeKey(key: string): void {
    if (dangerousKeys.has(key)) {
        throw new PlanError('dangerous_key', `The key ${JSON.stringify(key)} is not allowed.`);
    }
}
