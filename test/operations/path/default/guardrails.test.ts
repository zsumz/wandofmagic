import { describe, expect, it } from 'vitest';

import { emitTrustedMapperModule } from '../../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import { spell } from '../../../../src/index.js';
import { expectPlanError } from '../../../support/expect-plan-error.js';

describe('deep default guardrails', () => {
    it('rejects cycles and unsafe paths and supports static emission', () => {
        interface Cyclic {
            role?: string;
            self?: Cyclic;
        }
        const node: Cyclic = {};
        node.self = node;
        const result = spell<{ node: Cyclic }>()
            .default(['node', 'self', 'role'], 'user')
            .build()
            .safeRun({ node });
        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'invalid_input', path: ['node', 'self'] }],
            ok: false,
        });

        const dangerous = ['profile', 'constructor'] as unknown as readonly ['profile', 'role'];
        expectPlanError(
            () => spell<{ profile?: { role?: string } }>().default(dangerous, 'user'),
            'dangerous_key',
        );
        const deep = spell<{ profile?: { role?: string } }>()
            .default(['profile', 'role'], 'user')
            .build();
        expect(emitTrustedMapperModule(deep).mode).toBe('trusted-discard');
    });
});
