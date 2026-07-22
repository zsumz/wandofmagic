import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/builder/spell/spell.js';
import { emitTrustedMapperModule } from '../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import { materializeGeneratedMapper } from '../support/materialize-generated-mapper.js';

describe('static trusted mapper path write batches', () => {
    it('shares trim parents and emits safe omit cursors', async () => {
        const compiled = spell<{
            metadata: { source: string };
            profile: { first: string; last: string; secret: string };
        }>()
            .trim([['profile', 'first'], ['profile', 'last']])
            .omit([['profile', 'secret'], ['metadata', 'source']])
            .build();
        const artifact = emitTrustedMapperModule(compiled);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);
        const input = {
            metadata: { source: 'wire' },
            profile: { first: ' Ada ', last: ' Lovelace ', secret: 'private' },
        };

        expect(generated(input)).toEqual({
            metadata: {},
            profile: { first: 'Ada', last: 'Lovelace' },
        });
        expect(input.profile).toEqual({
            first: ' Ada ', last: ' Lovelace ', secret: 'private',
        });
        expect(artifact.source).toContain('let $trimParent0_0;');
        expect(artifact.source).toContain('$defineField($trimParent0_0, "last"');
        expect(artifact.source).toContain('const $omitRead1_0 = $readPath');
    });
});
