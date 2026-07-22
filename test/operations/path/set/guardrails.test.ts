import { describe, expect, it } from 'vitest';
import { emitTrustedMapperModule } from '../../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import type { PathInput } from '../../../../src/core/path/path.js';
import { spell } from '../../../../src/index.js';
import { expectPlanError } from '../../../support/expect-plan-error.js';

describe('deep set guardrails', () => {
    it('rejects unsafe paths at plan time', () => {
        const dangerous = ['profile', 'constructor'] as unknown as PathInput;

        expectPlanError(
            () => spell<Record<string, unknown>>().set(dangerous, true),
            'dangerous_key',
        );
    });

    it('supports static emission', () => {
        const deep = spell<{ value: string }>().set(['metadata', 'source'], 'api').build();

        expect(emitTrustedMapperModule(deep).mode).toBe('trusted-discard');
    });
});
