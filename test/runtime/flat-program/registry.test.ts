import { describe, expect, it } from 'vitest';
import { spell } from '../../../src/builder/spell/spell.js';
import { getFlatProgram } from '../../../src/runtime/compiled-spell/flat-program-registry.js';

describe('flat-program registry', () => {
    it('retains the program privately without changing the public spell surface', () => {
        const normalize = spell<{ value: string }>().trim(['value']).build();

        expect(getFlatProgram(normalize)?.map((instruction) => instruction.kind)).toEqual(['trim']);
        expect('flatProgram' in normalize).toBe(false);
    });
});
