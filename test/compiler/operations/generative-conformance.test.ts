import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { emitTrustedMapperModule } from '../../../src/compiler/index.js';
import { captureMapperOutcome } from '../support/capture-mapper-outcome.js';
import { materializeGeneratedMapper } from '../support/materialize-generated-mapper.js';
import { operationConformanceSpell } from './conformance-fixture.js';

const input = fc.record(
    {
        count: fc.oneof(fc.integer(), fc.string()),
        custom: fc.string(),
        date: fc.oneof(
            fc.date({ noInvalidDate: true }),
            fc.string(),
        ),
        fallback: fc.integer(),
        flag: fc.oneof(fc.boolean(), fc.string()),
        secret: fc.string(),
        source: fc.string(),
        text: fc.oneof(fc.bigInt(), fc.boolean(), fc.integer(), fc.string()),
    },
    {
        requiredKeys: ['custom', 'date', 'secret', 'source', 'text'],
    },
);

describe('static trusted mapper generative conformance', () => {
    it('matches optimized runtime outcomes across shrinkable inputs', async () => {
        const artifact = emitTrustedMapperModule(operationConformanceSpell);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);

        fc.assert(fc.property(input, (value) => {
            Object.freeze(value);

            expect(captureMapperOutcome(() => generated(value))).toBe(
                captureMapperOutcome(() => operationConformanceSpell.run(
                    value,
                    { input: 'trusted', receipt: 'discard' },
                )),
            );
        }), { numRuns: 1_000 });
    });
});
