import { describe, expect, it } from 'vitest';
import { normalizePath } from '../../src/runtime/path/normalize-path.js';
import { readPath } from '../../src/runtime/path/read-path.js';
import { setPathValue } from '../../src/runtime/path/set-path-value.js';
import { asObject, dataRecord, ownValue } from './test-support.js';

describe('copy-on-write path set', () => {
    it('sets a frozen nested field while preserving untouched references and input', () => {
        const untouched = Object.freeze({ stable: true });
        const profile = Object.freeze({ name: 'Ada', untouched });
        const root = dataRecord(Object.freeze({ profile }));
        const result = setPathValue(root, normalizePath(['profile', 'name']), 'Grace');

        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.changed).toBe(true);
        expect(result.value).not.toBe(root);
        expect(readPath(root, normalizePath(['profile', 'name']))).toMatchObject({ value: 'Ada' });
        expect(readPath(result.value, normalizePath(['profile', 'name'])))
            .toMatchObject({ value: 'Grace' });
        const outputProfile = ownValue(result.value, 'profile');
        expect(outputProfile).not.toBe(profile);
        expect(ownValue(asObject(outputProfile), 'untouched')).toBe(untouched);
    });

    it('returns the original root for an Object.is no-op', () => {
        const root = dataRecord({ profile: { score: Number.NaN } });
        const result = setPathValue(root, normalizePath(['profile', 'score']), Number.NaN);

        expect(result).toEqual({ changed: false, ok: true, value: root });
    });
});
