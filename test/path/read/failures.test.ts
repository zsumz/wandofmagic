import { describe, expect, it } from 'vitest';
import { normalizePath } from '../../../src/runtime/path/normalize-path.js';
import { readPath } from '../../../src/runtime/path/read-path.js';

describe('checked path read failures', () => {
    it('rejects cycles and converts throwing reflection into a value-free issue', () => {
        const cyclic: { self?: unknown } = {};
        cyclic.self = cyclic;
        const hostile = new Proxy({}, {
            getOwnPropertyDescriptor() {
                throw new Error('private trap detail');
            },
        });

        expect(readPath({ cyclic }, normalizePath(['cyclic', 'self', 'value']))).toMatchObject({
            issue: { code: 'invalid_input', path: ['cyclic', 'self'] },
            status: 'failed',
        });
        const reflected = readPath({ hostile }, normalizePath(['hostile', 'value']));
        expect(reflected).toMatchObject({ issue: { code: 'invalid_input' }, status: 'failed' });
        expect(JSON.stringify(reflected)).not.toContain('private trap detail');
    });
});
