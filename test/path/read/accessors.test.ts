import { describe, expect, it } from 'vitest';
import { normalizePath } from '../../../src/runtime/path/normalize-path.js';
import { readPath } from '../../../src/runtime/path/read-path.js';

describe('checked path accessor safety', () => {
    it('never executes a nested getter', () => {
        let getterCalls = 0;
        const profile = Object.defineProperty({}, 'secret', {
            enumerable: true,
            get() {
                getterCalls += 1;
                return 'hidden';
            },
        });

        expect(readPath({ profile }, normalizePath(['profile', 'secret']))).toMatchObject({
            issue: { code: 'unsupported_accessor', path: ['profile', 'secret'] },
            status: 'failed',
        });
        expect(getterCalls).toBe(0);
    });
});
