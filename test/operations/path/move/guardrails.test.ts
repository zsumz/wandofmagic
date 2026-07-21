import { describe, expect, it } from 'vitest';

import { CompilerError } from '../../../../src/compiler/error/compiler-error.js';
import { emitTrustedMapperModule } from '../../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import { spell, wand } from '../../../../src/index.js';
import { expectPlanError } from '../../../support/expect-plan-error.js';

describe('move guardrails', () => {
    it('rejects overlapping and dangerous paths and fails closed in the static compiler', () => {
        expectPlanError(
            () => spell<{ profile: { legacy: string } }>()
                .move(['profile'], ['profile', 'legacy']),
            'invalid_path',
        );
        expectPlanError(
            () => spell<{ profile: { legacy: string } }>()
                .move(['profile', 'legacy'], ['profile']),
            'invalid_path',
        );
        expectPlanError(
            () => spell<{ profile: { legacy: string } }>()
                .move(['profile', 'legacy'], ['profile', 'legacy']),
            'invalid_path',
        );

        const dangerous = ['output', 'constructor'] as unknown as readonly ['output', 'value'];
        expectPlanError(
            () => spell<{ source: string }>().move('source', dangerous),
            'dangerous_key',
        );
        const compiled = spell<{ source: string }>().move('source', 'target').build();
        expect(() => emitTrustedMapperModule(compiled)).toThrow(CompilerError);
        expect(wand({ profile: { legacy: 'value' } })
            .move(['profile', 'legacy'], ['profile', 'current'])
            .value()).toEqual({ profile: { current: 'value' } });
    });
});
