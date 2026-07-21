import { describe, expect, it } from 'vitest';

import { emitTrustedMapperModule } from '../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import { captureMapperOutcome } from '../support/capture-mapper-outcome.js';
import { materializeGeneratedMapper } from '../support/materialize-generated-mapper.js';
import {
    operationConformanceInputs,
    operationConformanceSpell,
} from './conformance-fixture.js';

describe('static trusted mapper operation conformance', () => {
    it('preserves built-in, custom, transform, and callback failure semantics', async () => {
        const artifact = emitTrustedMapperModule(operationConformanceSpell);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);

        for (const input of operationConformanceInputs) {
            expect(captureMapperOutcome(() => generated(input))).toBe(
                captureMapperOutcome(() => operationConformanceSpell.run(
                    input,
                    { input: 'trusted', receipt: 'discard' },
                )),
            );
        }
    });
});
