import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/builder/spell/spell.js';
import { emitTrustedMapperModule } from '../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import type { Spell } from '../../../src/core/execution/spell.js';
import { captureMapperOutcome } from '../support/capture-mapper-outcome.js';
import { materializeGeneratedMapper } from '../support/materialize-generated-mapper.js';

describe('static trusted mapper path container hardening', () => {
    it('rejects sibling accessors without executing them', async () => {
        const compiled = spell<{ profile: { value: string } }>()
            .set(['profile', 'value'], 'updated')
            .build();
        const input = { profile: { value: 'original' } };
        const accessor = expect.unreachable;
        Object.defineProperty(input.profile, 'secret', {
            enumerable: true,
            get: accessor,
        });

        await expectGeneratedParity(compiled, input);
    });

    it('matches cycle, frozen-input, and array-shape semantics', async () => {
        interface Cyclic {
            label: string;
            self?: Cyclic;
        }
        const node: Cyclic = { label: 'root' };
        node.self = node;
        const cyclic = spell<{ node: Cyclic }>()
            .transform(['node', 'self', 'label'], (label) => label.toUpperCase())
            .build();
        await expectGeneratedParity(cyclic, { node });

        const frozenInput = Object.freeze({ profile: Object.freeze({ value: 'original' }) });
        const frozen = spell<{ profile: { value: string } }>()
            .set(['profile', 'value'], 'updated')
            .build();
        await expectGeneratedParity(frozen, frozenInput);
        expect(frozenInput.profile.value).toBe('original');

        const rows = [{ value: 'original' }];
        Object.defineProperty(rows, 'extra', { enumerable: true, value: 'unsupported' });
        const arrayShape = spell<{ rows: Array<{ value: string }> }>()
            .set(['rows', 0, 'value'], 'updated')
            .build();
        await expectGeneratedParity(arrayShape, { rows });
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
