import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/index.js';

describe('runtime root-shape security', () => {
    it('rejects class instances at the root', () => {
        class UserRecord {
            public name = 'Ada';
        }

        const result = spell<UserRecord>().build().safeRun(new UserRecord());
        expect(result).toMatchObject({ issues: [{ code: 'invalid_input' }], ok: false });
    });
});
