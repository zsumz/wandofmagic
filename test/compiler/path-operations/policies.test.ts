import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/builder/spell/spell.js';
import { number } from '../../../src/coerce/builtin/number.js';
import { emitTrustedMapperModule } from '../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import type { Spell } from '../../../src/core/execution/spell.js';
import { captureMapperOutcome } from '../support/capture-mapper-outcome.js';
import { materializeGeneratedMapper } from '../support/materialize-generated-mapper.js';

describe('static trusted mapper path policies', () => {
    it('preserves missing, preserve, and overwrite behavior', async () => {
        const copyMissing = spell<{ source?: string }>()
            .copy('source', 'target', { missing: 'skip' })
            .build();
        const copyPreserve = spell<{ source: string; target: string }>()
            .copy('source', 'target', { conflict: 'preserve' })
            .build();
        const copyOverwrite = spell<{ source: string; target: string }>()
            .copy('source', 'target', { conflict: 'overwrite' })
            .build();
        const moveMissing = spell<{ source?: string }>()
            .move('source', 'target', { missing: 'skip' })
            .build();
        const movePreserve = spell<{ source: string; target: string }>()
            .move('source', 'target', { conflict: 'preserve' })
            .build();
        const moveOverwrite = spell<{ source: string; target: string }>()
            .move('source', 'target', { conflict: 'overwrite' })
            .build();

        await expectGeneratedParity(copyMissing, {});
        await expectGeneratedParity(copyPreserve, { source: 'new', target: 'old' });
        await expectGeneratedParity(copyOverwrite, { source: 'new', target: 'old' });
        await expectGeneratedParity(moveMissing, {});
        await expectGeneratedParity(movePreserve, { source: 'new', target: 'old' });
        await expectGeneratedParity(moveOverwrite, { source: 'new', target: 'old' });
    });

    it('preserves missing policies for nested coercion and transform', async () => {
        const coerceMissing = spell<{ profile: { count?: string } }>()
            .coerce(['profile', 'count'], number(), { missing: 'skip' })
            .build();
        const transformMissing = spell<{ profile: { value?: string } }>()
            .transform(
                ['profile', 'value'],
                (value) => value.toUpperCase(),
                { missing: 'skip' },
            )
            .build();

        await expectGeneratedParity(coerceMissing, { profile: {} });
        await expectGeneratedParity(transformMissing, { profile: {} });
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
