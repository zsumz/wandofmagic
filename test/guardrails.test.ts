import { describe, expect, it } from 'vitest';
import { PlanError, spell } from '../src/index.js';

describe('data and security guardrails', () => {
    it('never executes enumerable getters', () => {
        let calls = 0;
        const input = Object.defineProperty({}, 'secret', {
            enumerable: true,
            get() {
                calls += 1;
                return 'do not read';
            },
        });

        const result = spell<Record<string, unknown>>().build().safeRun(input);

        expect(result).toMatchObject({
            issues: [{ code: 'unsupported_accessor', path: ['secret'] }],
            ok: false,
        });
        expect(calls).toBe(0);
    });

    it('rejects prototype-pollution path segments in plans', () => {
        expect(() => spell<{ safe: string }>().rename({ safe: '__proto__' } as never)).toThrow(
            PlanError,
        );
    });

    it('snapshots own dangerous input keys without changing the output prototype', () => {
        const input = Object.defineProperty({}, '__proto__', {
            enumerable: true,
            value: { polluted: true },
        });

        const output = spell<Record<string, unknown>>().build().run(input);

        expect(Object.getPrototypeOf(output)).toBe(Object.prototype);
        expect(Object.getOwnPropertyDescriptor(output, '__proto__')?.value).toEqual({
            polluted: true,
        });
        expect(Object.prototype).not.toHaveProperty('polluted');
    });

    it('rejects class instances at the root', () => {
        class UserRecord {
            public name = 'Ada';
        }

        const result = spell<UserRecord>().build().safeRun(new UserRecord());
        expect(result).toMatchObject({ issues: [{ code: 'invalid_input' }], ok: false });
    });

    it('does not include thrown causes in serialized issues', () => {
        const normalize = spell<{ value: string }>()
            .transform('value', () => {
                throw new Error('sensitive details');
            })
            .build();

        const result = normalize.safeRun({ value: 'x' });
        expect(result.ok).toBe(false);
        expect(JSON.stringify(result)).not.toContain('sensitive details');
    });
});
