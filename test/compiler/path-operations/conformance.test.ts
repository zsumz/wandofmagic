import { describe, expect, it } from 'vitest';

import { emitTrustedMapperModule } from '../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import { captureMapperOutcome } from '../support/capture-mapper-outcome.js';
import { materializeGeneratedMapper } from '../support/materialize-generated-mapper.js';
import {
    pathOperationConformanceInputs,
    pathOperationConformanceSpell,
} from './conformance-fixture.js';

describe('static trusted mapper path-operation conformance', () => {
    it('emits every deep operation with equivalent values and failures', async () => {
        const artifact = emitTrustedMapperModule(pathOperationConformanceSpell);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);

        expect(artifact.source).not.toContain('not-serialized');
        expect(artifact.source).not.toContain('function $readPath($root, $path)');
        expect(artifact.source).toContain('function $readPath0($root)');
        expect(artifact.bindingDescriptions.map((binding) => binding.kind)).toEqual([
            'coercer',
            'default',
            'set',
            'transform',
            'derive',
        ]);
        for (const input of pathOperationConformanceInputs) {
            expect(captureMapperOutcome(() => generated(input))).toBe(
                captureMapperOutcome(() => pathOperationConformanceSpell.run(
                    input,
                    { input: 'trusted', receipt: 'discard' },
                )),
            );
        }
    });
});
