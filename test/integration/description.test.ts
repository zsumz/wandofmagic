import { describe, expect, it } from 'vitest';
import { normalizeUser } from './normalize-user.js';

describe('user normalization description', () => {
    it('describes the plan without inspecting data', () => {
        expect(normalizeUser.describe()).toMatchObject({
            name: 'normalize-user',
            version: 1,
        });
        expect(Object.isFrozen(normalizeUser.describe())).toBe(true);
        expect(Object.isFrozen(normalizeUser.describe().steps)).toBe(true);
        expect(Object.isFrozen(normalizeUser.describe().steps[0]?.reads)).toBe(true);
        expect(normalizeUser.describe().steps.at(-2)).toEqual({
            id: 'derive-display-name',
            kind: 'derive',
            reads: [['firstName'], ['lastName']],
            removes: [],
            writes: [['displayName']],
        });
    });
});
