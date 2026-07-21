import { describe, expect, it } from 'vitest';

import { normalizePath } from '../../src/runtime/path/normalize-path.js';
import { setPathValue } from '../../src/runtime/path/set-path-value.js';
import {
    asObject,
    createNullPrototype,
    dataRecord,
    ownValue,
} from './test-support.js';

describe('copy-on-write data-model safety', () => {
    it('preserves null prototypes and safely copies an own __proto__ sibling', () => {
        const profile = createNullPrototype();
        Object.defineProperty(profile, '__proto__', {
            configurable: true,
            enumerable: true,
            value: { safe: true },
            writable: true,
        });
        Object.defineProperty(profile, 'name', {
            configurable: true,
            enumerable: true,
            value: 'Ada',
            writable: true,
        });
        const root = dataRecord({ profile });
        const result = setPathValue(root, normalizePath(['profile', 'name']), 'Grace');

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        const outputProfile = asObject(ownValue(result.value, 'profile'));
        expect(Object.getPrototypeOf(outputProfile)).toBeNull();
        expect(ownValue(outputProfile, '__proto__')).toEqual({ safe: true });
    });

    it('rejects accessors and symbols in touched containers without executing getters', () => {
        let getterCalls = 0;
        const profile = Object.defineProperty({ name: 'Ada' }, 'computed', {
            enumerable: true,
            get() {
                getterCalls += 1;
                return 'private';
            },
        });
        const accessorResult = setPathValue(
            dataRecord({ profile }),
            normalizePath(['profile', 'name']),
            'Grace',
        );
        expect(accessorResult).toMatchObject({
            issue: { code: 'unsupported_accessor' },
            ok: false,
        });
        expect(getterCalls).toBe(0);

        const symbol = Symbol('private');
        const symbolProfile = { name: 'Ada', [symbol]: 'hidden' };
        const symbolResult = setPathValue(
            dataRecord({ profile: symbolProfile }),
            normalizePath(['profile', 'name']),
            'Grace',
        );
        expect(symbolResult).toMatchObject({ issue: { code: 'invalid_input' }, ok: false });
        expect(JSON.stringify(symbolResult)).not.toContain('hidden');
    });
});
