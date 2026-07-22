import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/builder/spell/spell.js';
import { emitTrustedMapperModule } from '../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import { materializeGeneratedMapper } from '../support/materialize-generated-mapper.js';

describe('static trusted mapper path projections', () => {
    it('emits a final projection trie without generic path loops', () => {
        const compiled = spell<{ profile: { first: string; last: string } }>()
            .pick([['profile', 'first'], ['profile', 'last']])
            .build();
        const source = emitTrustedMapperModule(compiled).source;

        expect(source).toContain('let $projectedNode0_0;');
        expect(source).toContain('$value = $projected0;');
        expect(source).not.toContain('function $projectPaths');
        expect(source).not.toContain('function $writeProjectedPath');
        expect(source).not.toContain('function $replaceRecord');
    });

    it('keeps projected aliases isolated from later writes', async () => {
        const compiled = spell<{
            mirror?: { value: string };
            source: { value: string };
        }>()
            .set(['source', 'value'], 'first')
            .copy(['source'], ['mirror'])
            .pick([['source'], ['mirror']])
            .set(['source', 'value'], 'second')
            .build();
        const artifact = emitTrustedMapperModule(compiled);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);

        expect(generated({ source: { value: 'input' } })).toEqual({
            mirror: { value: 'first' },
            source: { value: 'second' },
        });
    });
});
