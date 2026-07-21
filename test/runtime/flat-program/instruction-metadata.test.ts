import { describe, expect, it } from 'vitest';
import { number } from '../../../src/coerce/builtin/number.js';
import type { ExecutableStep } from '../../../src/core/plan/executable-step.js';
import type {
    ErasedDerive,
    ErasedTransform,
} from '../../../src/internal/type-boundary/callback.js';
import { createCoerceStep } from '../../../src/operations/flat/coerce/create-coerce-step.js';
import { createDefaultStep } from '../../../src/operations/flat/default/create-default-step.js';
import { createDeriveStep } from '../../../src/operations/flat/derive/create-derive-step.js';
import { createOmitStep } from '../../../src/operations/flat/omit/create-omit-step.js';
import { createRenameStep } from '../../../src/operations/flat/rename/create-rename-step.js';
import { createTransformStep } from '../../../src/operations/flat/transform/create-transform-step.js';
import { createTrimStep } from '../../../src/operations/flat/trim/create-trim-step.js';
import { requireFlatProgram } from './require-flat-program.js';

describe('flat instruction metadata', () => {
    it('captures every operation in order as structurally frozen metadata', () => {
        const fallback = Object.freeze({ role: 'reader' });
        const transform: ErasedTransform = () => 'transformed';
        const derive: ErasedDerive = () => 'derived';
        const steps: readonly ExecutableStep[] = [
            createRenameStep({ source: 'destination' }, 'rename:1'),
            createTrimStep(['destination'], 'trim:2'),
            createCoerceStep('count', number({ integer: true }), 'skip', 'coerce:3'),
            createDefaultStep('profile', fallback, 'default:4'),
            createTransformStep('destination', transform, 'error', 'transform:5'),
            createDeriveStep('label', ['destination'], derive, 'derive:6'),
            createOmitStep(['secret'], 'omit:7'),
        ];

        const flatProgram = requireFlatProgram(steps);
        expect(flatProgram.map((instruction) => instruction.kind)).toEqual([
            'rename',
            'trim',
            'coerce',
            'default',
            'transform',
            'derive',
            'omit',
        ]);
        expect(Object.isFrozen(flatProgram)).toBe(true);
        expect(flatProgram.every((instruction) => Object.isFrozen(instruction))).toBe(true);

        const [rename, trim, coerce, defaultValue, transformed, derived, omit] = flatProgram;
        expect(rename).toMatchObject({
            entries: [{ destination: 'destination', source: 'source' }],
            id: 'rename:1',
        });
        expect(rename?.kind === 'rename' && Object.isFrozen(rename.entries)).toBe(true);
        expect(trim).toMatchObject({ keys: ['destination'] });
        expect(coerce).toMatchObject({
            coercer: { integer: true, kind: 'number' },
            key: 'count',
            missing: 'skip',
        });
        expect(defaultValue?.kind === 'default' && defaultValue.fallback).toBe(fallback);
        expect(transformed?.kind === 'transform' && transformed.binding).toBe(transform);
        expect(derived?.kind === 'derive' && derived.binding).toBe(derive);
        expect(omit).toMatchObject({ keys: ['secret'] });
    });
});
