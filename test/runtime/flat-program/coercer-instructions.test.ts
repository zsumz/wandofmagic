import { describe, expect, it } from 'vitest';
import { boolean } from '../../../src/coerce/builtin/boolean.js';
import { isoDate } from '../../../src/coerce/builtin/iso-date.js';
import { number } from '../../../src/coerce/builtin/number.js';
import { string } from '../../../src/coerce/builtin/string.js';
import { defineCoercer } from '../../../src/coerce/types.js';
import { createCoerceStep } from '../../../src/operations/flat/coerce/create-coerce-step.js';
import { requireFlatProgram } from './require-flat-program.js';

describe('flat coercer instructions', () => {
    it('identifies every built-in coercer with a stable opcode', () => {
        const flatProgram = requireFlatProgram([
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
        const flatProgram = requireFlatProgram([
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
