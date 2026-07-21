import { describe, expect, it, vi } from 'vitest';
import type { Coercer } from '../../../src/coerce/types.js';
import type {
    MissingOptions,
    StepOptions,
} from '../../../src/core/plan/operation-options.js';
import type { PathInput } from '../../../src/core/path/path.js';
import {
    invokeBuilderCoerce,
    invokeBuilderDefault,
    invokeBuilderOmit,
    invokeBuilderTransform,
} from '../../../src/internal/type-boundary/builder.js';
import type { ErasedTransform } from '../../../src/internal/type-boundary/callback.js';

const path: PathInput = ['profile', 'age'];
const missingOptions: MissingOptions<'skip'> = { missing: 'skip' };
const stepOptions: StepOptions = { id: 'fixture' };

describe('builder type boundaries', () => {
    it('forwards coerce calls and preserves the returned builder', () => {
        const next = { stage: 'coerced' };
        const coerce = vi.fn(() => next);
        const coercer: Coercer<unknown, unknown> = {
            name: 'fixture',
            run: value => ({ ok: true, value }),
        };

        const result = invokeBuilderCoerce<typeof next>(
            { coerce }, path, coercer, missingOptions,
        );

        expect(result).toBe(next);
        expect(coerce).toHaveBeenCalledExactlyOnceWith(path, coercer, missingOptions);
    });

    it('forwards default calls and preserves the returned builder', () => {
        const next = { stage: 'defaulted' };
        const applyDefault = vi.fn(() => next);
        const fallback = 'unknown';

        const result = invokeBuilderDefault<typeof next>(
            { default: applyDefault }, path, fallback, stepOptions,
        );

        expect(result).toBe(next);
        expect(applyDefault).toHaveBeenCalledExactlyOnceWith(path, fallback, stepOptions);
    });

    it('forwards omit calls and preserves the returned builder', () => {
        const next = { stage: 'omitted' };
        const omit = vi.fn(() => next);
        const paths: readonly PathInput[] = ['password', path];

        const result = invokeBuilderOmit<typeof next>({ omit }, paths, stepOptions);

        expect(result).toBe(next);
        expect(omit).toHaveBeenCalledExactlyOnceWith(paths, stepOptions);
    });

    it('forwards transform calls and preserves the returned builder', () => {
        const next = { stage: 'transformed' };
        const applyTransform = vi.fn(() => next);
        const transform: ErasedTransform = value => value;

        const result = invokeBuilderTransform<typeof next>(
            { transform: applyTransform }, path, transform, missingOptions,
        );

        expect(result).toBe(next);
        expect(applyTransform).toHaveBeenCalledExactlyOnceWith(
            path, transform, missingOptions,
        );
    });
});
