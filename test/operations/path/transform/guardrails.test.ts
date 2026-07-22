import { describe, expect, it, vi } from 'vitest';

import { emitTrustedMapperModule } from '../../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import { spell } from '../../../../src/index.js';
import { expectPlanError } from '../../../support/expect-plan-error.js';

describe('deep transform guardrails', () => {
    it('rejects cycles and unsafe paths and supports static emission', () => {
        interface Cyclic {
            label: string;
            self?: Cyclic;
        }
        const node: Cyclic = { label: 'root' };
        node.self = node;
        const callback = vi.fn((value: string) => value.toUpperCase());
        const result = spell<{ node: Cyclic }>()
            .transform(['node', 'self', 'label'], callback)
            .build()
            .safeRun({ node });
        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'invalid_input', path: ['node', 'self'] }],
            ok: false,
        });
        expect(callback).not.toHaveBeenCalled();

        const dangerous = ['profile', 'constructor'] as unknown as readonly ['profile', 'value'];
        expectPlanError(
            () => spell<{ profile: { value: string } }>().transform(dangerous, String),
            'dangerous_key',
        );

        const deep = spell<{ profile: { value: string } }>()
            .transform(['profile', 'value'], (value) => value.toUpperCase())
            .build();
        expect(emitTrustedMapperModule(deep).mode).toBe('trusted-discard');
    });
});
