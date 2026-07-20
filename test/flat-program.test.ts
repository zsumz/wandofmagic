import { describe, expect, it } from 'vitest';

import { boolean } from '../src/coerce/boolean.js';
import { isoDate } from '../src/coerce/iso-date.js';
import { defineCoercer } from '../src/coerce/types.js';
import { number } from '../src/coerce/number.js';
import { string } from '../src/coerce/string.js';
import { spell } from '../src/builder/spell.js';
import type { ExecutableStep } from '../src/core/executable-step.js';
import type { FlatProgram } from '../src/instructions/flat-operation.js';
import type { ErasedDerive, ErasedTransform } from '../src/internal/type-boundary.js';
import { createCoerceStep } from '../src/operations/coerce.js';
import { createDefaultStep } from '../src/operations/default.js';
import { createDeriveStep } from '../src/operations/derive.js';
import { createOmitStep } from '../src/operations/omit.js';
import { createRenameStep } from '../src/operations/rename.js';
import { createTransformStep } from '../src/operations/transform.js';
import { createTrimStep } from '../src/operations/trim.js';
import { compileFlatProgram } from '../src/runtime/compile-flat-program.js';
import { getFlatProgram } from '../src/runtime/flat-program-registry.js';

describe('flat compiler instructions', () => {
    it('retains the program privately without changing the public spell surface', () => {
        const normalize = spell<{ value: string }>().trim(['value']).build();

        expect(getFlatProgram(normalize)?.map((instruction) => instruction.kind)).toEqual(['trim']);
        expect('flatProgram' in normalize).toBe(false);
    });

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

        const flatProgram = requiredFlatProgram(steps);
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

    it('identifies every built-in coercer with a stable opcode', () => {
        const flatProgram = requiredFlatProgram([
            createCoerceStep('boolean', boolean({ caseSensitive: true }), 'error', 'coerce:1'),
            createCoerceStep('number', number({ integer: true }), 'error', 'coerce:2'),
            createCoerceStep('string', string(), 'error', 'coerce:3'),
            createCoerceStep('date', isoDate(), 'error', 'coerce:4'),
        ]);

        expect(flatProgram.map((instruction) =>
            instruction.kind === 'coerce' ? instruction.coercer : undefined)).toEqual([
            { caseSensitive: true, kind: 'boolean' },
            { integer: true, kind: 'number' },
            { kind: 'string' },
            { kind: 'iso-date' },
        ]);
    });

    it('keeps custom coercers as explicit opaque bindings', () => {
        const custom = defineCoercer<unknown, unknown>({
            name: 'custom-test',
            run: (value) => ({ ok: true, value }),
        });
        const flatProgram = requiredFlatProgram([
            createCoerceStep('value', custom, 'error', 'coerce:1'),
        ]);
        const [instruction] = flatProgram;

        expect(instruction).toMatchObject({
            coercer: { binding: custom.run, kind: 'custom', name: 'custom-test' },
        });
        expect(
            instruction?.kind === 'coerce' && Object.isFrozen(instruction.coercer),
        ).toBe(true);
    });
});

function requiredFlatProgram(steps: readonly ExecutableStep[]): FlatProgram {
    const program = compileFlatProgram(steps);
    if (program === undefined) {
        throw new Error('Expected a flat instruction fixture.');
    }
    return program;
}
