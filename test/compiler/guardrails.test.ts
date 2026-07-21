import { describe, expect, it } from 'vitest';

import { spell } from '../../src/builder/spell/spell.js';
import { CompilerError } from '../../src/compiler/error/compiler-error.js';
import { emitTrustedMapperModule } from '../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import type { Spell } from '../../src/core/execution/spell.js';
import { captureCompilerError } from './support/capture-compiler-error.js';

describe('static trusted mapper guardrails', () => {
    it('fails closed when structural projection cannot be proven', () => {
        const noStructuralEdges = spell<{ value: string }>().trim(['value']).build();
        const touchedOmit = spell<{ secret: string; source: string }>()
            .rename({ source: 'value' })
            .trim(['secret'])
            .omit(['secret'])
            .build();
        const overlappingRename = spell<{ first: string; second: string; secret: string }>()
            .rename({ first: 'second', second: 'third' })
            .omit(['secret'])
            .build();

        expect(() => emitTrustedMapperModule(noStructuralEdges)).toThrow(CompilerError);
        expect(() => emitTrustedMapperModule(touchedOmit)).toThrow(CompilerError);
        expect(() => emitTrustedMapperModule(overlappingRename)).toThrow(CompilerError);
    });

    it('rejects spell implementations without private compiler instructions', () => {
        const foreignSpell: Spell<{ value: string }, { value: string }> = {
            describe() {
                return { steps: [] };
            },
            run(input) {
                return input;
            },
            safeRun(input) {
                return { changes: [], ok: true, value: input };
            },
        };

        expect(captureCompilerError(() => emitTrustedMapperModule(foreignSpell)).code)
            .toBe('unsupported_spell');
    });
});
