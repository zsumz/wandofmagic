import { describe, expect, it } from 'vitest';

import { emitTrustedMapperModule } from '../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import { captureMapperOutcome } from '../support/capture-mapper-outcome.js';
import { materializeGeneratedMapper } from '../support/materialize-generated-mapper.js';
import {
    nullPrototypeProjectionInput,
    projectionConformanceInputs,
    projectionConformanceSpell,
} from './conformance-fixture.js';

describe('static trusted mapper projection', () => {
    it('emits and executes a value-free mapper with equivalent outcomes', async () => {
        const artifact = emitTrustedMapperModule(projectionConformanceSpell);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);

        expect(artifact.mode).toBe('trusted-discard');
        expect(artifact.source).not.toContain('not-serialized');
        expect(artifact.bindingDescriptions).toEqual([
            { index: 0, kind: 'default', stepId: 'default:4' },
            { index: 1, kind: 'derive', stepId: 'derive:5' },
        ]);
        for (const input of projectionConformanceInputs) {
            expect(captureMapperOutcome(() => generated(input))).toBe(
                captureMapperOutcome(() => projectionConformanceSpell.run(
                    input,
                    { input: 'trusted', receipt: 'discard' },
                )),
            );
        }
        expect(captureMapperOutcome(() => generated(nullPrototypeProjectionInput))).toBe(
            captureMapperOutcome(() => projectionConformanceSpell.run(
                nullPrototypeProjectionInput,
                { input: 'trusted', receipt: 'discard' },
            )),
        );
    });
});
