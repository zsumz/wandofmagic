import { describe, expect, it } from 'vitest';

import { spell } from '../../src/builder/spell/spell.js';
import { PlanError } from '../../src/core/plan/plan-error.js';
import type { PathInput, PathSegment } from '../../src/core/path/path.js';
import { normalizePath } from '../../src/runtime/path/normalize-path.js';

describe('path normalization', () => {
    it('normalizes top-level shorthand and freezes a copied deep tuple', () => {
        const mutable: [string, string, number, string] = ['order', 'items', 0, 'sku'];
        const normalized = normalizePath(mutable);
        mutable[1] = 'changed';

        expect(normalizePath('email')).toEqual(['email']);
        expect(normalized).toEqual(['order', 'items', 0, 'sku']);
        expect(Object.isFrozen(normalized)).toBe(true);
    });

    it('normalizes negative zero and accepts the eight-segment boundary', () => {
        expect(normalizePath(['items', -0, 'value'])).toEqual(['items', 0, 'value']);
        expect(normalizePath(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])).toHaveLength(8);
    });

    it('rejects malformed, dangerous, numeric, and over-budget paths at plan time', () => {
        const invalidPaths: readonly PathSegment[][] = [
            [],
            [0, 'value'],
            ['items', -1],
            ['items', 1.5],
            ['items', Number.MAX_SAFE_INTEGER + 1],
        ];
        for (const path of invalidPaths) {
            expect(() => normalizePath(unsafePath(path))).toThrow(PlanError);
        }
        for (const dangerous of ['__proto__', 'prototype', 'constructor']) {
            expect(capturePlanError(() => normalizePath(['profile', dangerous])).code)
                .toBe('dangerous_key');
        }
        expect(capturePlanError(() =>
            normalizePath(unsafePath(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']))).code)
            .toBe('path_too_deep');
    });

    it('keeps ordinary spells record-rooted', () => {
        const identity = spell<readonly string[]>().build();
        const result = identity.safeRun(['value']);

        expect(result).toMatchObject({
            issues: [{ code: 'invalid_input' }],
            ok: false,
        });
    });
});

function unsafePath(segments: readonly PathSegment[]): PathInput {
    // Deliberately cross the TypeScript boundary to cover JavaScript callers.
    return segments as PathInput;
}

function capturePlanError(run: () => unknown): PlanError {
    try {
        run();
    } catch (error) {
        if (error instanceof PlanError) {
            return error;
        }
        throw error;
    }
    throw new Error('Expected path normalization to fail.');
}
