import { describe, expect, it } from 'vitest';

import { spell } from '../../src/builder/spell/spell.js';
import { emitTrustedMapperModule } from '../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import type { Spell } from '../../src/core/execution/spell.js';
import { createRenameStep } from '../../src/operations/flat/rename/create-rename-step.js';
import { CompiledSpell } from '../../src/runtime/compiled-spell/compiled-spell.js';
import { captureCompilerError } from './support/capture-compiler-error.js';
import { captureMapperOutcome } from './support/capture-mapper-outcome.js';
import { materializeGeneratedMapper } from './support/materialize-generated-mapper.js';

describe('static trusted mapper guardrails', () => {
    it('falls back to sequential emission when structural projection cannot be proven', async () => {
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

        await expectGeneratedParity(noStructuralEdges, { value: '  ready  ' });
        await expectGeneratedParity(touchedOmit, { secret: '  hidden  ', source: 'ready' });
        await expectGeneratedParity(
            overlappingRename,
            { first: 'one', second: 'two', secret: 'hidden' },
        );
    });

    it('emits structural programs larger than a bit mask', async () => {
        const mapping = Object.fromEntries(
            Array.from({ length: 40 }, (_, index) => [`field${String(index)}`, `value${String(index)}`]),
        );
        const input = Object.fromEntries(
            Array.from({ length: 40 }, (_, index) => [`field${String(index)}`, index]),
        );
        const large: CompiledSpell<object, object> = new CompiledSpell(
            [createRenameStep(mapping, 'rename:1')],
            {},
        );
        const artifact = emitTrustedMapperModule(large);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);

        expect(captureMapperOutcome(() => generated(input))).toBe(
            captureMapperOutcome(() => large.run(
                input,
                { input: 'trusted', receipt: 'discard' },
            )),
        );
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

async function expectGeneratedParity<Input extends object, Output extends object>(
    compiled: Spell<Input, Output>,
    input: Input,
): Promise<void> {
    const artifact = emitTrustedMapperModule(compiled);
    const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);
    expect(captureMapperOutcome(() => generated(input))).toBe(
        captureMapperOutcome(() => compiled.run(
            input,
            { input: 'trusted', receipt: 'discard' },
        )),
    );
}
